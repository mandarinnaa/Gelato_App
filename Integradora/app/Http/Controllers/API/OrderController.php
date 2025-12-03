<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\DeliveryStatus;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Requests\UpdateOrderRequest;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Http\Requests\UpdateOrderStatusRequest;
use App\Http\Requests\AssignDeliveryRequest;
use App\Services\DeliveryAssignmentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OrderController extends Controller
{
    protected $deliveryService;

    public function __construct(DeliveryAssignmentService $deliveryService)
    {
        $this->deliveryService = $deliveryService;
    }

    public function deliveryWorkload()
    {
        $workload = $this->deliveryService->getDeliveryWorkload();
        
        return response()->json([
            'success' => true,
            'message' => 'Carga de trabajo de repartidores',
            'data' => $workload
        ], 200);
    }

    /**
     * Display a listing of orders.
     */
    public function index(Request $request)
    {
        $query = Order::with([
            'user', 
            'deliveryPerson', 
            'address', 
            'paymentMethod', 
            'deliveryStatus', 
            'orderItems.baseProduct',
            'orderItems.customProduct'
        ]);

        // Filtros
        if ($request->has('delivery_status_id')) {
            $query->where('delivery_status_id', $request->delivery_status_id);
        }

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->has('delivery_person_id')) {
            $query->where('delivery_person_id', $request->delivery_person_id);
        }

        $orders = $query->orderBy('created_at', 'desc')->paginate(15);

        // ✅ TRANSFORMAR PARA INCLUIR image_url COMPLETA
        // ✅ TRANSFORMAR PARA INCLUIR image_url COMPLETA
        $orders->getCollection()->transform(function ($order) {
            if ($order->orderItems) {
                $order->orderItems->transform(function ($item) {
                    // Agregar image_url al baseProduct usando el accessor del modelo
                    if ($item->baseProduct) {
                        $item->baseProduct->image_url = $item->baseProduct->image_url;
                    }
                    
                    // Agregar image_url al customProduct si existe
                    if ($item->customProduct && $item->customProduct->image) {
                        $item->customProduct->image_url = url('storage/' . $item->customProduct->image);
                    }
                    
                    return $item;
                });
            }
            return $order;
        });

        return response()->json([
            'success' => true,
            'data' => $orders
        ], 200);
    }

    /**
     * Store a newly created order.
     */
    public function store(StoreOrderRequest $request)
    {
        DB::beginTransaction();

        try {
            // Obtener estado pendiente
            $pendienteStatus = DeliveryStatus::where('name', 'pendiente')->first();
            
            if (!$pendienteStatus) {
                throw new \Exception('Estado "pendiente" no encontrado en la base de datos');
            }

            // Crear pedido (SIN user_payment_card_id)
            $order = Order::create([
                'user_id' => $request->user_id,
                'address_id' => $request->address_id,
                'payment_method_id' => 3, // Siempre PayPal (ID 3)
                'delivery_status_id' => $pendienteStatus->id,
                'total' => 0,
                'paypal_order_id' => $request->paypal_order_id ?? null,
            ]);

            $total = 0;

            // Crear items del pedido
            foreach ($request->items as $item) {
                $product = \App\Models\BaseProduct::find($item['product_id']);
                
                if (!$product) {
                    throw new \Exception("Producto {$item['product_id']} no encontrado");
                }

                $subtotal = $product->final_price * $item['quantity'];

                OrderItem::create([
                    'order_id' => $order->id,
                    'base_product_id' => $item['product_id'],
                    'product_type' => 'base',
                    'product_name' => $product->name,
                    'quantity' => $item['quantity'],
                    'unit_price' => $product->final_price,
                    'subtotal' => $subtotal,
                ]);

                $total += $subtotal;
            }

            // Actualizar total
            $order->update(['total' => $total]);

            // Registrar en historial
            $order->statusHistory()->create([
                'delivery_status_id' => $pendienteStatus->id,
                'changed_by' => $request->user_id,
                'notes' => 'Pedido creado con pago de PayPal',
            ]);

            DB::commit();

            Log::info('✅ Orden creada exitosamente', [
                'order_id' => $order->id,
                'user_id' => $request->user_id,
                'total' => $total
            ]);

            // Cargar relaciones con image_url
            $order->load(['orderItems.baseProduct', 'deliveryStatus']);
            
            // Transformar para incluir image_url
            if ($order->orderItems) {
                $order->orderItems->transform(function ($item) {
                    if ($item->baseProduct) {
                        $item->baseProduct->image_url = $item->baseProduct->image_url;
                    }
                    return $item;
                });
            }

            return response()->json([
                'success' => true,
                'message' => 'Pedido creado exitosamente',
                'data' => $order
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('❌ Error al crear orden', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al crear el pedido',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified order.
     */
    public function show(Order $order)
    {
        $order->load([
            'user',
            'deliveryPerson',
            'address',
            'paymentMethod',
            'deliveryStatus',
            'orderItems.baseProduct',
            'orderItems.customProduct',
            'statusHistory.deliveryStatus'
        ]);

        // Transformar para incluir image_url
        if ($order->orderItems) {
            $order->orderItems->transform(function ($item) {
                if ($item->baseProduct) {
                    $item->baseProduct->image_url = $item->baseProduct->image_url;
                }
                if ($item->customProduct && $item->customProduct->image) {
                    $item->customProduct->image_url = url('storage/' . $item->customProduct->image);
                }
                return $item;
            });
        }

        return response()->json([
            'success' => true,
            'data' => $order
        ], 200);
    }

    /**
     * Update the specified order.
     */
    public function update(UpdateOrderRequest $request, Order $order)
    {
        $order->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Pedido actualizado exitosamente',
            'data' => $order->load(['deliveryPerson', 'deliveryStatus'])
        ], 200);
    }

    /**
     * Update order status.
     */
    public function updateStatus(UpdateOrderStatusRequest $request, Order $order)
    {
        $order->changeStatus(
            $request->delivery_status_id,
            $request->user()->id,
            $request->notes
        );

        return response()->json([
            'success' => true,
            'message' => 'Estado del pedido actualizado exitosamente',
            'data' => $order->fresh()->load(['deliveryStatus', 'statusHistory.deliveryStatus'])
        ], 200);
    }

    /**
     * Assign delivery person to order.
     */
    public function assignDelivery(AssignDeliveryRequest $request, Order $order)
    {
        $order->update([
            'delivery_person_id' => $request->delivery_person_id
        ]);

        // Cambiar a estado "en_camino"
        $enCaminoStatus = DeliveryStatus::where('name', 'en_camino')->first();
        
        if ($enCaminoStatus) {
            $order->changeStatus($enCaminoStatus->id, $request->user()->id, 'Repartidor asignado');
        }

        return response()->json([
            'success' => true,
            'message' => 'Repartidor asignado exitosamente',
            'data' => $order->fresh()->load(['deliveryPerson', 'deliveryStatus'])
        ], 200);
    }

    /**
     * Get order tracking.
     */
    public function tracking(Order $order)
    {
        return response()->json([
            'success' => true,
            'data' => [
                'order' => $order->load(['deliveryStatus', 'deliveryPerson', 'address']),
                'history' => $order->statusHistory()
                    ->with('deliveryStatus', 'changedBy')
                    ->orderBy('created_at', 'asc')
                    ->get()
            ]
        ], 200);
    }

    /**
     * Remove the specified order.
     */
    public function destroy(Order $order)
    {
        $order->delete();

        return response()->json([
            'success' => true,
            'message' => 'Pedido eliminado exitosamente'
        ], 200);
    }

    /**
     * Convierte imagen PNG a base64 compatible con DomPDF
     */
    private function getLogoBase64()
    {
        try {
            $imagePath = storage_path('app/public/img/Sereno.png');
            
            if (!file_exists($imagePath)) {
                Log::warning('Logo no encontrado en: ' . $imagePath);
                return null;
            }

            // Verificar que GD esté disponible
            if (!extension_loaded('gd')) {
                Log::error('Extensión GD no está cargada');
                return null;
            }

            // Cargar imagen PNG
            $image = imagecreatefrompng($imagePath);
            
            if (!$image) {
                Log::error('No se pudo crear la imagen desde PNG');
                return null;
            }

            // Convertir a JPG (más compatible con DomPDF)
            ob_start();
            imagejpeg($image, null, 90); // Calidad 90%
            $imageData = ob_get_contents();
            ob_end_clean();
            imagedestroy($image);

            // Convertir a base64
            return 'data:image/jpeg;base64,' . base64_encode($imageData);

        } catch (\Exception $e) {
            Log::error('Error al procesar logo: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Generate and return the order ticket as PDF.
     */
    public function generateTicket(Request $request, $orderId)
    {
        try {
            $order = Order::findOrFail($orderId);
            $order->load([
                'user',
                'address',
                'paymentMethod',
                'deliveryStatus',
                'orderItems.baseProduct',
                'orderItems.customProduct.flavor',
                'orderItems.customProduct.size',
                'orderItems.customProduct.filling',
                'deliveryPerson'
            ]);

            $data = [
                'order' => $order,
                'business_name' => config('app.name', 'SERENO'),
                'business_address' => 'Dirección de tu negocio',
                'business_phone' => 'Teléfono de contacto',
                'business_tax_id' => 'RFC o Tax ID',
            ];

            $pdf = Pdf::loadView('tickets.order', $data);
            $pdf->setPaper([0, 0, 226.77, 841.89], 'portrait');

            return $pdf->stream('ticket-orden-' . $order->id . '.pdf');

        } catch (\Exception $e) {
            Log::error('Error generando ticket: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al generar el ticket',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function downloadTicket(Request $request, $orderId)
    {
        try {
            $order = Order::findOrFail($orderId);
            $order->load([
                'user',
                'address',
                'paymentMethod',
                'deliveryStatus',
                'orderItems.baseProduct',
                'orderItems.customProduct.flavor',
                'orderItems.customProduct.size',
                'orderItems.customProduct.filling',
                'deliveryPerson'
            ]);

            $data = [
                'order' => $order,
                'business_name' => config('app.name', 'SERENO'),
                'business_address' => 'Dirección de tu negocio',
                'business_phone' => 'Teléfono de contacto',
                'business_tax_id' => 'RFC o Tax ID',
            ];

            $pdf = Pdf::loadView('tickets.order', $data);
            $pdf->setPaper([0, 0, 226.77, 841.89], 'portrait');

            return $pdf->download('ticket-orden-' . $order->id . '.pdf');
            
        } catch (\Exception $e) {
            Log::error('Error descargando ticket: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al descargar el ticket',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}