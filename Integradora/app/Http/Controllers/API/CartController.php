<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\BaseProduct;
use App\Models\CustomProduct;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\PaymentTransaction;
use App\Services\PointsService;
use App\Services\DeliveryAssignmentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class CartController extends Controller
{
    protected $pointsService;
    protected $deliveryService;
    
    // ✅ Definir costo de envío como constante
    const SHIPPING_COST = 50.00;
    
    public function __construct(PointsService $pointsService, DeliveryAssignmentService $deliveryService)
    {
        $this->pointsService = $pointsService;
        $this->deliveryService = $deliveryService;
    }

    /**
     * Calcula el precio con descuento de membresía si aplica
     */
    private function applyMembershipDiscount($price, $user)
    {
        if (!$user || !$user->membership) {
            return $price;
        }
        
        $discountPercent = floatval($user->membership->discount_percent ?? 0);
        $discount = ($price * $discountPercent) / 100;
        
        Log::info('💳 Aplicando descuento de membresía al carrito:', [
            'precio_original' => $price,
            'descuento_porcentaje' => $discountPercent,
            'descuento_monto' => $discount,
            'precio_final' => $price - $discount
        ]);
        
        return $price - $discount;
    }

    /**
     * Obtener el carrito del usuario autenticado.
     */
    public function index(Request $request)
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no autenticado',
                    'data' => [
                        'cart_id' => null,
                        'items' => [],
                        'items_count' => 0,
                        'total' => 0
                    ]
                ], 401);
            }
            
            $cart = Cart::where('user_id', $user->id)->first();
            
            if (!$cart) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'cart_id' => null,
                        'items' => [],
                        'items_count' => 0,
                        'total' => 0
                    ]
                ], 200);
            }
            
            $cart->load([
                'items.baseProduct.category',
                'items.baseProduct.flavor',
                'items.customProduct.size',
                'items.customProduct.flavor',
                'items.customProduct.filling',
                'items.size'
            ]);
            
            $formattedItems = $cart->items->map(function($item) {
                return $item->getDetails();
            });
            
            return response()->json([
                'success' => true,
                'data' => [
                    'cart_id' => $cart->id,
                    'items' => $formattedItems,
                    'items_count' => $cart->items->count(),
                    'total' => (float) $cart->total
                ]
            ], 200);
            
        } catch (\Exception $e) {
            Log::error('❌ Error al obtener carrito:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error al cargar el carrito',
                'data' => [
                    'cart_id' => null,
                    'items' => [],
                    'items_count' => 0,
                    'total' => 0
                ]
            ], 500);
        }
    }

    /**
     * Agregar un PRODUCTO BASE al carrito.
     */
    public function addBaseProduct(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'base_product_id' => 'required|exists:base_products,id',
            'quantity' => 'required|integer|min:1'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        $validated = $validator->validated();
        $user = $request->user();
        $user->load('membership');
        
        $baseProduct = BaseProduct::findOrFail($validated['base_product_id']);
        
        if (!$baseProduct->available) {
            return response()->json([
                'success' => false,
                'message' => 'El producto no está disponible'
            ], 400);
        }

    // ✅ Validar stock disponible
    $requestedQuantity = $validated['quantity'];
    
    // Verificar si ya existe en el carrito para sumar cantidades
    $cart = $user->getOrCreateCart();
    $existingItem = CartItem::where('cart_id', $cart->id)
        ->where('product_type', 'base')
        ->where('base_product_id', $validated['base_product_id'])
        ->first();
    
    $currentCartQuantity = $existingItem ? $existingItem->quantity : 0;
    $totalQuantity = $currentCartQuantity + $requestedQuantity;
    
    if ($totalQuantity > $baseProduct->stock) {
        return response()->json([
            'success' => false,
            'message' => 'Stock insuficiente. Disponible: ' . $baseProduct->stock . ', en carrito: ' . $currentCartQuantity,
            'available_stock' => $baseProduct->stock,
            'current_in_cart' => $currentCartQuantity
        ], 400);
    }    

        $originalPrice = floatval($baseProduct->final_price);
        $priceWithDiscount = $this->applyMembershipDiscount($originalPrice, $user);

        Log::info('🛒 Agregando producto al carrito:', [
            'producto' => $baseProduct->name,
            'precio_original' => $originalPrice,
            'precio_con_descuento' => $priceWithDiscount,
            'tiene_membresia' => !!$user->membership,
            'descuento_aplicado' => $user->membership ? $user->membership->discount_percent : 0
        ]);

        DB::beginTransaction();
        
        try {
            // Cart already created above for stock validation

            if ($existingItem) {
                $existingItem->quantity += $validated['quantity'];
                $existingItem->subtotal = $existingItem->unit_price * $existingItem->quantity;
                $existingItem->save();
            } else {
                CartItem::create([
                    'cart_id' => $cart->id,
                    'product_type' => 'base',
                    'base_product_id' => $validated['base_product_id'],
                    'quantity' => $validated['quantity'],
                    'unit_price' => $priceWithDiscount,
                    'subtotal' => $priceWithDiscount * $validated['quantity']
                ]);
            }

            DB::commit();
            
            $cart->calculateTotal();
            $cart->refresh();
            
            Log::info('🛒 Producto agregado - Total actualizado:', [
                'cart_id' => $cart->id,
                'total' => $cart->total,
                'items_count' => $cart->items()->count()
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Producto agregado al carrito',
                'data' => $this->getCartDetails($cart)
            ], 200);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Error al agregar producto al carrito:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error al agregar producto al carrito',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Agregar un PRODUCTO PERSONALIZADO al carrito.
     */
    public function addCustomProduct(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'size_id' => 'required|exists:sizes,id',
            'flavor_id' => 'required|exists:flavors,id',
            'filling_id' => 'nullable|exists:fillings,id',
            'toppings' => 'nullable|array',
            'toppings.*' => 'exists:toppings,id',
            'quantity' => 'required|integer|min:1'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        $validated = $validator->validated();
        $user = $request->user();
        $user->load('membership');

        $basePrice = CustomProduct::calculatePrice(
            $validated['flavor_id'],
            $validated['size_id'],
            $validated['filling_id'] ?? null,
            $validated['toppings'] ?? []
        );

        if (!$basePrice) {
            return response()->json([
                'success' => false,
                'message' => 'No se pudo calcular el precio. Verifica la combinación de sabor y tamaño.'
            ], 400);
        }

        $finalPrice = $this->applyMembershipDiscount($basePrice, $user);

        DB::beginTransaction();
        
        try {
            $customProduct = CustomProduct::create([
                'user_id' => $user->id,
                'size_id' => $validated['size_id'],
                'flavor_id' => $validated['flavor_id'],
                'filling_id' => $validated['filling_id'] ?? null,
                'toppings' => $validated['toppings'] ?? null,
                'final_price' => $finalPrice,
                'status' => 'in_cart'
            ]);

            $cart = $user->getOrCreateCart();

            CartItem::create([
                'cart_id' => $cart->id,
                'product_type' => 'custom',
                'custom_product_id' => $customProduct->id,
                'quantity' => $validated['quantity'],
                'unit_price' => $finalPrice,
                'subtotal' => $finalPrice * $validated['quantity']
            ]);

            DB::commit();
            
            $cart->calculateTotal();
            $cart->refresh();
            
            return response()->json([
                'success' => true,
                'message' => 'Producto personalizado agregado al carrito',
                'data' => $this->getCartDetails($cart)
            ], 200);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Error al agregar producto personalizado:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error al agregar producto personalizado al carrito',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar cantidad de un item del carrito.
     */
    public function updateItem(Request $request, $cartItem)
    {
        $validator = Validator::make($request->all(), [
            'quantity' => 'required|integer|min:1'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        $cart = $user->cart;

        if (!$cart) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes un carrito'
            ], 404);
        }
        
        $cartItem = CartItem::where('id', $cartItem)
            ->where('cart_id', $cart->id)
            ->first();

        if (!$cartItem) {
            return response()->json([
                'success' => false,
                'message' => 'Item no encontrado en el carrito'
            ], 404);
        }

        // ✅ Validar stock si es producto base
        if ($cartItem->product_type === 'base' && $cartItem->base_product_id) {
            $baseProduct = BaseProduct::find($cartItem->base_product_id);
            
            if ($baseProduct && $request->quantity > $baseProduct->stock) {
                return response()->json([
                    'success' => false,
                    'message' => 'Stock insuficiente. Disponible: ' . $baseProduct->stock,
                    'available_stock' => $baseProduct->stock
                ], 400);
            }
        }

        $cartItem->quantity = $request->quantity;
        $cartItem->subtotal = $cartItem->unit_price * $request->quantity;
        $cartItem->save();

        $cart->calculateTotal();
        $cart->refresh();

        return response()->json([
            'success' => true,
            'message' => 'Cantidad actualizada',
            'data' => $this->getCartDetails($cart)
        ], 200);
    }

    /**
     * Eliminar un item del carrito.
     */
    public function removeItem(Request $request, $cartItem)
    {
        $user = $request->user();
        $cart = $user->cart;

        if (!$cart) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes un carrito'
            ], 404);
        }
        
        $cartItem = CartItem::where('id', $cartItem)
            ->where('cart_id', $cart->id)
            ->first();

        if (!$cartItem) {
            return response()->json([
                'success' => false,
                'message' => 'Item no encontrado en el carrito'
            ], 404);
        }

        if ($cartItem->product_type === 'custom' && $cartItem->custom_product_id) {
            $customProduct = CustomProduct::find($cartItem->custom_product_id);
            if ($customProduct) {
                $customProduct->delete();
            }
        }

        $cartItem->delete();
        
        $cart->calculateTotal();
        $cart->refresh();
        
        return response()->json([
            'success' => true,
            'message' => 'Producto eliminado del carrito',
            'data' => $this->getCartDetails($cart)
        ], 200);
    }

    /**
     * Vaciar carrito.
     */
    public function clear(Request $request)
    {
        $user = $request->user();
        $cart = $user->cart;
        
        if (!$cart) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes un carrito'
            ], 404);
        }

        $customProductIds = $cart->items()
            ->where('product_type', 'custom')
            ->whereNotNull('custom_product_id')
            ->pluck('custom_product_id');

        if ($customProductIds->isNotEmpty()) {
            CustomProduct::whereIn('id', $customProductIds)->delete();
        }
        
        $cart->clear();
        
        return response()->json([
            'success' => true,
            'message' => 'Carrito vaciado',
            'data' => $this->getCartDetails($cart)
        ], 200);
    }

    /**
     * ✅ CHECKOUT COMPLETO con asignación automática de repartidor
     */
    public function checkout(Request $request)
    {
        try {
            DB::beginTransaction();
            
            // ✅ Validar datos incluyendo puntos
            $validated = $request->validate([
                'address_id' => 'required|exists:addresses,id',
                'paypal_order_id' => 'required|string',
                'paypal_transaction_id' => 'required|string',
                'payer_id' => 'nullable|string',
                'points_to_redeem' => 'nullable|integer|min:0'
            ]);
            
            $user = $request->user();
            $user->load('membership');
            
            Log::info('🔵 Iniciando checkout', [
                'user_id' => $user->id,
                'paypal_order_id' => $validated['paypal_order_id'],
                'points_to_redeem' => $validated['points_to_redeem'] ?? 0
            ]);

            // ✅ Verificar si ya existe una orden con este paypal_order_id
            $existingOrder = Order::where('paypal_order_id', $validated['paypal_order_id'])
                ->where('user_id', $user->id)
                ->first();

            if ($existingOrder) {
                Log::info('⚠️ Orden ya existe para este pago', [
                    'order_id' => $existingOrder->id,
                    'paypal_order_id' => $validated['paypal_order_id']
                ]);

                DB::commit();

                return response()->json([
                    'success' => true,
                    'message' => 'Pedido ya procesado anteriormente',
                    'data' => [
                        'order' => $existingOrder->load([
                            'orderItems.baseProduct',
                            'orderItems.customProduct',
                            'deliveryStatus',
                            'address',
                            'deliveryPerson'
                        ])
                    ],
                    'already_processed' => true
                ], 200);
            }

            // ✅ Obtener carrito
            $cart = Cart::where('user_id', $user->id)->first();
            
            if (!$cart || $cart->items()->count() === 0) {
                Log::error('❌ Carrito vacío al hacer checkout', [
                    'user_id' => $user->id,
                    'cart_exists' => !!$cart,
                    'items_count' => $cart ? $cart->items()->count() : 0
                ]);

                DB::rollBack();

                return response()->json([
                    'success' => false,
                    'message' => 'El carrito está vacío',
                ], 400);
            }

            $cart->load([
                'items.baseProduct',
                'items.customProduct.flavor'
            ]);

            // ✅ CRÍTICO: Calcular total INCLUYENDO ENVÍO
            $cartSubtotal = floatval($cart->total);
            $shippingCost = self::SHIPPING_COST;
            $orderTotalWithShipping = $cartSubtotal + $shippingCost;
            
            Log::info('📊 Totales calculados', [
                'cart_subtotal' => $cartSubtotal,
                'shipping_cost' => $shippingCost,
                'total_with_shipping' => $orderTotalWithShipping
            ]);

            // ✅ APLICAR DESCUENTO POR PUNTOS (sobre total CON ENVÍO)
            $pointsDiscount = 0;
            $pointsToRedeem = $validated['points_to_redeem'] ?? 0;
            
            if ($pointsToRedeem > 0) {
                // ✅ CRÍTICO: Refrescar usuario para obtener puntos actualizados
                $user->refresh();
                
                // ✅ USAR COLUMNA POINTS DIRECTAMENTE (no el accessor available_points)
                // El accessor calcula basado en transacciones que pueden estar desincronizadas
                $userPoints = $user->points;
                
                Log::info('🔍 Verificando puntos disponibles', [
                    'user_id' => $user->id,
                    'points_column' => $userPoints,
                    'requested_points' => $pointsToRedeem,
                    'available_points_accessor' => $user->available_points
                ]);
                
                // Verificar que el usuario tenga suficientes puntos
                if ($userPoints < $pointsToRedeem) {
                    DB::rollBack();
                    
                    return response()->json([
                        'success' => false,
                        'message' => 'Puntos insuficientes',
                        'available_points' => $userPoints,
                        'requested_points' => $pointsToRedeem
                    ], 400);
                }
                
                // ✅ Calcular descuento sobre total CON ENVÍO
                $pointsDiscount = $this->pointsService->calculatePointsDiscount(
                    $pointsToRedeem, 
                    $orderTotalWithShipping
                );
                
                Log::info('💰 Descuento por puntos aplicado', [
                    'points_redeemed' => $pointsToRedeem,
                    'discount_amount' => $pointsDiscount,
                    'cart_subtotal' => $cartSubtotal,
                    'shipping_cost' => $shippingCost,
                    'total_with_shipping' => $orderTotalWithShipping,
                    'final_total' => $orderTotalWithShipping - $pointsDiscount
                ]);
            }

            // ✅ Total final después del descuento de puntos
            $finalTotal = $orderTotalWithShipping - $pointsDiscount;

            // ✅ Crear orden con el total final
            $order = Order::create([
                'user_id' => $user->id,
                'address_id' => $validated['address_id'],
                'payment_method_id' => 3, // PayPal
                'delivery_status_id' => 1, // Pendiente
                'total' => $finalTotal,
                'paypal_order_id' => $validated['paypal_order_id'],
                'paypal_transaction_id' => $validated['paypal_transaction_id']
            ]);

            Log::info('📦 Orden creada:', [
                'order_id' => $order->id,
                'total' => $order->total
            ]);

            // ✅ ASIGNAR REPARTIDOR AUTOMÁTICAMENTE
            $deliveryPerson = $this->deliveryService->assignDeliveryPerson($order);

            if ($deliveryPerson) {
                Log::info('🚚 Repartidor asignado automáticamente', [
                    'order_id' => $order->id,
                    'delivery_person_id' => $deliveryPerson->id,
                    'delivery_person_name' => $deliveryPerson->name
                ]);
            } else {
                Log::warning('⚠️ No se pudo asignar repartidor automáticamente', [
                    'order_id' => $order->id
                ]);
            }

            // ✅ Registrar transacción de pago
            $transaction = PaymentTransaction::create([
                'user_id' => $user->id,
                'order_id' => $order->id,
                'payment_type' => 'paypal',
                'status' => 'completed',
                'transaction_id' => $validated['paypal_transaction_id'],
                'payment_id' => $validated['paypal_order_id'],
                'payer_id' => $validated['payer_id'] ?? null,
                'amount' => $finalTotal,
                'currency' => 'MXN',
                'description' => "Pago de pedido #{$order->id} - {$cart->items()->count()} producto(s) - Envío incluido",
                'metadata' => [
                    'items_count' => $cart->items()->count(),
                    'cart_id' => $cart->id,
                    'address_id' => $validated['address_id'],
                    'user_membership' => $user->membership ? $user->membership->name : 'Básica',
                    'cart_subtotal' => $cartSubtotal,
                    'shipping_cost' => $shippingCost,
                    'total_with_shipping' => $orderTotalWithShipping,
                    'points_redeemed' => $pointsToRedeem,
                    'points_discount' => $pointsDiscount,
                    'final_total' => $finalTotal,
                    'delivery_person_assigned' => $deliveryPerson ? $deliveryPerson->name : 'No asignado'
                ],
                'completed_at' => now()
            ]);

            Log::info('💳 Transacción registrada:', [
                'transaction_id' => $transaction->id,
                'amount' => $transaction->amount
            ]);

            // ✅ Crear items de la orden y descontar stock
            foreach ($cart->items as $item) {
                if ($item->product_type === 'base' && $item->baseProduct) {
                    $productName = $item->baseProduct->name;
                    
                    // ✅ Descontar stock del producto base
                    $baseProduct = $item->baseProduct;
                    if ($baseProduct->stock < $item->quantity) {
                        DB::rollBack();
                        return response()->json([
                            'success' => false,
                            'message' => "Stock insuficiente para {$productName}. Disponible: {$baseProduct->stock}"
                        ], 400);
                    }
                    
                    $baseProduct->decrement('stock', $item->quantity);
                    
                    Log::info('📦 Stock descontado', [
                        'product' => $productName,
                        'quantity' => $item->quantity,
                        'remaining_stock' => $baseProduct->stock - $item->quantity
                    ]);
                    
                } elseif ($item->product_type === 'custom' && $item->customProduct) {
                    $productName = 'Pastel Personalizado - ' . $item->customProduct->flavor->name;
                } else {
                    $productName = 'Producto';
                }

                $orderItem = $order->orderItems()->create([
                    'product_type' => $item->product_type,
                    'base_product_id' => $item->base_product_id,
                    'custom_product_id' => $item->custom_product_id,
                    'product_name' => $productName,
                    'quantity' => $item->quantity,
                    'unit_price' => $item->unit_price,
                    'subtotal' => $item->subtotal
                ]);

                Log::info('📝 OrderItem creado:', [
                    'order_item_id' => $orderItem->id,
                    'product_name' => $productName
                ]);
            }

            // ✅ CANJEAR PUNTOS SI APLICA
            if ($pointsToRedeem > 0) {
                try {
                    $this->pointsService->redeemPointsForOrder($user, $pointsToRedeem, $order);
                    
                    Log::info('✅ Puntos canjeados exitosamente', [
                        'user_id' => $user->id,
                        'points_redeemed' => $pointsToRedeem,
                        'order_id' => $order->id
                    ]);
                } catch (\Exception $e) {
                    Log::error('❌ Error al canjear puntos', [
                        'error' => $e->getMessage(),
                        'user_id' => $user->id,
                        'points' => $pointsToRedeem
                    ]);
                }
            }

            // ✅ OTORGAR PUNTOS POR LA COMPRA
            try {
                $this->pointsService->processOrderPoints($order);
                
                $pointsEarned = $user->calculatePointsForPurchase($finalTotal);
                
                Log::info('✅ Puntos otorgados por compra', [
                    'user_id' => $user->id,
                    'points_earned' => $pointsEarned,
                    'order_id' => $order->id,
                    'order_total' => $finalTotal
                ]);
            } catch (\Exception $e) {
                Log::error('❌ Error al otorgar puntos', [
                    'error' => $e->getMessage(),
                    'user_id' => $user->id,
                    'order_id' => $order->id
                ]);
            }

            // ✅ Registrar historial de estado
            $statusNote = 'Pedido creado - Pago con PayPal completado';
            if ($deliveryPerson) {
                $statusNote .= " - Repartidor asignado: {$deliveryPerson->name}";
            }

            $order->statusHistory()->create([
                'delivery_status_id' => 1,
                'changed_by' => $user->id,
                'notes' => $statusNote
            ]);

            // ✅ Limpiar carrito
            $cart->items()->delete();
            $cart->update(['total' => 0]);

            Log::info('✅ Carrito limpiado', ['cart_id' => $cart->id]);

            DB::commit();

            // Recargar usuario y orden para obtener datos actualizados
            $user->refresh();
            $order->load([
                'orderItems.baseProduct',
                'orderItems.customProduct',
                'deliveryStatus',
                'address',
                'deliveryPerson'
            ]);
            
            $pointsEarned = $user->calculatePointsForPurchase($finalTotal);

            Log::info('✅ Checkout completado exitosamente', [
                'order_id' => $order->id,
                'transaction_id' => $transaction->id,
                'user_id' => $user->id,
                'total' => $order->total,
                'delivery_person' => $deliveryPerson ? $deliveryPerson->name : 'No asignado',
                'points_info' => [
                    'redeemed' => $pointsToRedeem,
                    'discount' => $pointsDiscount,
                    'earned' => $pointsEarned,
                    'new_balance' => $user->available_points
                ]
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Pedido creado exitosamente',
                'data' => [
                    'order' => $order,
                    'transaction' => [
                        'id' => $transaction->id,
                        'transaction_id' => $transaction->transaction_id,
                        'amount' => $transaction->amount,
                        'currency' => $transaction->currency,
                        'status' => $transaction->status
                    ],
                    'points_info' => [
                        'redeemed' => $pointsToRedeem,
                        'discount_applied' => $pointsDiscount,
                        'earned' => $pointsEarned,
                        'new_balance' => $user->available_points
                    ],
                    'delivery_info' => [
                        'assigned' => !!$deliveryPerson,
                        'delivery_person' => $deliveryPerson ? [
                            'id' => $deliveryPerson->id,
                            'name' => $deliveryPerson->name,
                            'email' => $deliveryPerson->email
                        ] : null
                    ]
                ]
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            
            Log::error('❌ Error de validación en checkout:', [
                'errors' => $e->errors()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Datos inválidos',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('❌ Error en checkout:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error al procesar el pedido',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Método auxiliar para obtener los detalles del carrito.
     */
    private function getCartDetails($cart)
    {
        $cart->load([
            'items.baseProduct.category',
            'items.baseProduct.flavor',
            'items.customProduct.size',
            'items.customProduct.flavor',
            'items.customProduct.filling',
            'items.size'
        ]);

        $formattedItems = $cart->items->map(function($item) {
            return $item->getDetails();
        });

        return [
            'cart_id' => $cart->id,
            'items' => $formattedItems,
            'items_count' => $cart->items->count(),
            'total' => (float) $cart->total
        ];
    }
}