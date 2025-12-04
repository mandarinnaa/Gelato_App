<?php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\PayPalService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PayPalPaymentController extends Controller
{
    protected $paypalService;

    public function __construct(PayPalService $paypalService)
    {
        $this->paypalService = $paypalService;
    }

    /**
     * Crear orden de pago en PayPal
     */
    public function createOrder(Request $request)
    {
        try {
            $validated = $request->validate([
                'total' => 'required|numeric|min:0.01',
                'description' => 'nullable|string',
                'order_id' => 'nullable|integer'
            ]);

            $frontendUrl = config('app.frontend_url', 'http://localhost:3000');

            Log::info('🔵 Creando orden en PayPal', [
                'total' => $validated['total'],
                'description' => $validated['description'] ?? 'Pedido'
            ]);

            $result = $this->paypalService->createOrder([
                'total' => $validated['total'],
                'description' => $validated['description'] ?? 'Pedido',
                'return_url' => "{$frontendUrl}/payment/success",
                'cancel_url' => "{$frontendUrl}/checkout"
            ]);

            if ($result['success']) {
                Log::info('✅ Orden creada en PayPal', [
                    'order_id' => $result['order_id'],
                    'approval_url' => $result['approval_url']
                ]);

                return response()->json([
                    'success' => true,
                    'order_id' => $result['order_id'],
                    'approval_url' => $result['approval_url']
                ]);
            }

            Log::error('❌ Error al crear orden en PayPal', [
                'message' => $result['message'] ?? 'Error desconocido'
            ]);

            return response()->json([
                'success' => false,
                'message' => $result['message'] ?? 'Error al crear orden'
            ], 400);

        } catch (\Exception $e) {
            Log::error('❌ Excepción al crear orden en PayPal', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al procesar el pago'
            ], 500);
        }
    }

    /**
     * ✅ ACTUALIZADO: Verificar y capturar orden
     */
    public function captureOrder(Request $request)
    {
        try {
            $orderId = $request->query('token');

            Log::info('🔵 Procesando retorno de PayPal', [
                'order_id' => $orderId,
                'query_params' => $request->query()
            ]);

            if (!$orderId) {
                Log::error('❌ Token de orden inválido');
                return response()->json([
                    'success' => false,
                    'message' => 'Token de orden inválido'
                ], 400);
            }

            // ✅ Usar el nuevo método que verifica antes de capturar
            $result = $this->paypalService->verifyAndCaptureOrder($orderId);

            if ($result['success']) {
                Log::info('✅ Orden procesada exitosamente', [
                    'order_id' => $result['order_id'],
                    'transaction_id' => $result['transaction_id'],
                    'status' => $result['status'],
                    'already_captured' => $result['already_captured'] ?? false
                ]);

                return response()->json([
                    'success' => true,
                    'order_id' => $result['order_id'],
                    'transaction_id' => $result['transaction_id'],
                    'status' => $result['status'],
                    'already_captured' => $result['already_captured'] ?? false
                ]);
            }

            Log::error('❌ Error al procesar orden', [
                'message' => $result['message'] ?? 'Error desconocido',
                'order_id' => $orderId
            ]);

            return response()->json([
                'success' => false,
                'message' => $result['message'] ?? 'Error al procesar la orden'
            ], 400);

        } catch (\Exception $e) {
            Log::error('❌ Excepción al procesar orden', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al completar el pago: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener detalles de orden
     */
    public function getOrderDetails($orderId)
    {
        try {
            Log::info('🔍 Obteniendo detalles de orden', ['order_id' => $orderId]);

            $result = $this->paypalService->getOrderDetails($orderId);

            if ($result['success']) {
                return response()->json([
                    'success' => true,
                    'data' => $result['data']
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => $result['message']
            ], 400);

        } catch (\Exception $e) {
            Log::error('❌ Error al obtener detalles de orden', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al obtener detalles'
            ], 500);
        }
    }
}