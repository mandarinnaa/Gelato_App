<?php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\BaseProduct;
use App\Http\Requests\StoreSaleRequest;
use App\Http\Requests\UpdateSaleRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf;

class SaleController extends Controller
{
    /**
     * Display a listing of sales.
     */
    public function index(Request $request)
    {
        $query = Sale::with(['employee', 'paymentMethod', 'saleItems.product']);
        
        // Filtros
        if ($request->has('employee_id')) {
            $query->where('employee_id', $request->employee_id);
        }
        
        if ($request->has('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        
        if ($request->has('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }
        
        $sales = $query->orderBy('created_at', 'desc')->paginate(15);
        
        return response()->json([
            'success' => true,
            'data' => $sales
        ], 200);
    }

    /**
     * Store a newly created sale.
     */
    public function store(StoreSaleRequest $request)
    {
        DB::beginTransaction();
        
        try {
            // ✅ VALIDAR STOCK ANTES DE CREAR LA VENTA
            foreach ($request->items as $item) {
                $product = BaseProduct::findOrFail($item['product_id']);
                
                // Verificar disponibilidad
                if (!$product->available) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => "El producto '{$product->name}' no está disponible"
                    ], 400);
                }
                
                // Verificar stock suficiente
                if ($product->stock < $item['quantity']) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => "Stock insuficiente para '{$product->name}'. Disponible: {$product->stock}, solicitado: {$item['quantity']}",
                        'available_stock' => $product->stock,
                        'requested_quantity' => $item['quantity']
                    ], 400);
                }
            }
            
            // Crear venta
            $sale = Sale::create([
                'employee_id' => $request->employee_id,
                'payment_method_id' => $request->payment_method_id,
                'total' => 0,
            ]);

            $total = 0;
            
            // Crear items de la venta y descontar stock
            foreach ($request->items as $item) {
                $product = BaseProduct::findOrFail($item['product_id']);
                
                $subtotal = $product->final_price * $item['quantity'];
                
                SaleItem::create([
                    'sale_id' => $sale->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $product->final_price,
                    'subtotal' => $subtotal,
                ]);
                
                // ✅ DESCONTAR STOCK
                $product->decrement('stock', $item['quantity']);
                
                \Log::info('📦 Stock descontado en venta POS', [
                    'product' => $product->name,
                    'quantity_sold' => $item['quantity'],
                    'remaining_stock' => $product->stock
                ]);
                
                $total += $subtotal;
            }
            
            // Actualizar total
            $sale->update(['total' => $total]);
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'Venta creada exitosamente',
                'data' => $sale->load(['saleItems.product', 'paymentMethod', 'employee']),
                'ticket_url' => route('sales.ticket', $sale->id)
            ], 201);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Error al crear la venta',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified sale.
     */
    public function show(Sale $sale)
    {
        return response()->json([
            'success' => true,
            'data' => $sale->load(['employee', 'paymentMethod', 'saleItems.product'])
        ], 200);
    }

    /**
     * Update the specified sale.
     */
    public function update(UpdateSaleRequest $request, Sale $sale)
    {
        $sale->update($request->validated());
        
        return response()->json([
            'success' => true,
            'message' => 'Venta actualizada exitosamente',
            'data' => $sale
        ], 200);
    }

    /**
     * Remove the specified sale.
     */
    public function destroy(Sale $sale)
    {
        $sale->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Venta eliminada exitosamente'
        ], 200);
    }

    /**
     * Generate and return the sale ticket as PDF.
     * Acepta autenticación tanto por Sanctum como por token en query string
     */
    public function generateTicket(Request $request, $saleId)
    {
        // Buscar la venta
        $sale = Sale::findOrFail($saleId);
        
        // Cargar relaciones necesarias
        $sale->load(['employee', 'paymentMethod', 'saleItems.product']);
        
        // Datos adicionales para el ticket
        $data = [
            'sale' => $sale,
            'business_name' => config('app.name', 'Mi Negocio'),
            'business_address' => 'Dirección de tu negocio',
            'business_phone' => 'Teléfono de contacto',
            'business_tax_id' => 'RFC o Tax ID',
        ];
        
        // Generar PDF con configuración para impresora térmica 58mm
        $pdf = Pdf::loadView('tickets.sale', $data);
        
        // Configurar tamaño de papel para 58mm (240px = 80mm de ancho aprox)
        $pdf->setPaper([0, 0, 226.77, 566.93], 'portrait'); // 80mm x 200mm en puntos
        
        return $pdf->stream('ticket-' . $sale->id . '.pdf');
    }

    /**
     * Download the sale ticket as PDF.
     */
    public function downloadTicket(Request $request, $saleId)
    {
        $sale = Sale::findOrFail($saleId);
        $sale->load(['employee', 'paymentMethod', 'saleItems.product']);
        
        $data = [
            'sale' => $sale,
            'business_name' => config('app.name', 'Mi Negocio'),
            'business_address' => 'Dirección de tu negocio',
            'business_phone' => 'Teléfono de contacto',
            'business_tax_id' => 'RFC o Tax ID',
        ];
        
        $pdf = Pdf::loadView('tickets.sale', $data);
        $pdf->setPaper([0, 0, 226.77, 566.93], 'portrait');
        
        return $pdf->download('ticket-' . $sale->id . '.pdf');
    }
}