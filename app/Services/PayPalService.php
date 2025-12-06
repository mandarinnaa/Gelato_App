<?php
namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PayPalService
{
    private $clientId;
    private $secret;
    private $mode;
    private $baseUrl;

    public function __construct()
    {
        $this->mode = config('services.paypal.mode', 'sandbox');
        $this->clientId = config('services.paypal.client_id');
        $this->secret = config('services.paypal.secret');

        if (empty($this->clientId) || empty($this->secret)) {
            throw new \Exception('PayPal credentials not configured');
        }

        $this->baseUrl = $this->mode === 'sandbox' 
            ? 'https://api-m.sandbox.paypal.com' 
            : 'https://api-m.paypal.com';

        Log::info('PayPal Service initialized', [
            'mode' => $this->mode,
            'base_url' => $this->baseUrl
        ]);
    }

    /**
     * Obtener token de acceso
     */
    private function getAccessToken()
    {
        try {
            Log::info('🔐 Obteniendo token de acceso de PayPal');

            $response = Http::withBasicAuth($this->clientId, $this->secret)
                ->asForm()
                ->post("{$this->baseUrl}/v1/oauth2/token", [
                    'grant_type' => 'client_credentials'
                ]);

            if ($response->failed()) {
                Log::error('❌ Error al autenticar con PayPal', [
                    'status' => $response->status(),
                    'body' => $response->json()
                ]);
                throw new \Exception('Failed to authenticate with PayPal');
            }

            Log::info('✅ Token de acceso obtenido');
            return $response->json()['access_token'];

        } catch (\Exception $e) {
            Log::error('❌ Excepción al obtener token', [
                'message' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * ✅ ACTUALIZADO: Crear orden de pago en PayPal con detección de tipo
     */
    public function createOrder($orderData)
    {
        try {
            $accessToken = $this->getAccessToken();

            // Determinar tipo de pedido (orden de productos o membresía)
            $isMembership = isset($orderData['is_membership']) && $orderData['is_membership'];
            $frontendUrl = config('app.frontend_url', 'http://localhost:3000');

            // URLs de retorno según el tipo
            $returnUrl = $isMembership 
                ? "{$frontendUrl}/membership/success"
                : ($orderData['return_url'] ?? "{$frontendUrl}/payment/success");

            $cancelUrl = $isMembership
                ? "{$frontendUrl}/memberships"
                : ($orderData['cancel_url'] ?? "{$frontendUrl}/checkout");

            Log::info('📦 Creando orden en PayPal', [
                'total' => $orderData['total'],
                'description' => $orderData['description'] ?? 'N/A',
                'is_membership' => $isMembership,
                'return_url' => $returnUrl
            ]);

            $response = Http::withToken($accessToken)
                ->post("{$this->baseUrl}/v2/checkout/orders", [
                    'intent' => 'CAPTURE',
                    'purchase_units' => [
                        [
                            'amount' => [
                                'currency_code' => 'MXN',
                                'value' => number_format($orderData['total'], 2, '.', '')
                            ],
                            'description' => $orderData['description'] ?? 'Pedido de pastelería'
                        ]
                    ],
                    'application_context' => [
                        'return_url' => $returnUrl,
                        'cancel_url' => $cancelUrl,
                        'brand_name' => 'Pastelería',
                        'locale' => 'es-MX',
                        'user_action' => 'PAY_NOW',
                        'shipping_preference' => 'NO_SHIPPING',
                        'landing_page' => 'BILLING',
                        'payment_method' => [
                            'payee_preferred' => 'IMMEDIATE_PAYMENT_REQUIRED',
                            'payer_selected' => 'PAYPAL',
                            'standard_entry_class_code' => 'WEB'
                        ]
                    ]
                ]);

            if ($response->failed()) {
                Log::error('❌ PayPal create order failed', [
                    'status' => $response->status(),
                    'body' => $response->json()
                ]);
                throw new \Exception('Error creating PayPal order');
            }

            $order = $response->json();

            Log::info('✅ Orden creada exitosamente', [
                'order_id' => $order['id'],
                'status' => $order['status'],
                'is_membership' => $isMembership
            ]);

            return [
                'success' => true,
                'order_id' => $order['id'],
                'approval_url' => collect($order['links'])->firstWhere('rel', 'approve')['href'] ?? null
            ];

        } catch (\Exception $e) {
            Log::error('❌ PayPal createOrder error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * ✅ Verificar y capturar orden
     */
    public function verifyAndCaptureOrder($orderId)
    {
        try {
            $accessToken = $this->getAccessToken();

            Log::info('🔍 Verificando estado de orden en PayPal', [
                'order_id' => $orderId
            ]);

            // 1. Obtener detalles de la orden
            $response = Http::withToken($accessToken)
                ->get("{$this->baseUrl}/v2/checkout/orders/{$orderId}");

            if ($response->failed()) {
                Log::error('❌ Error al verificar orden', [
                    'status' => $response->status(),
                    'body' => $response->json()
                ]);
                throw new \Exception('Error al verificar orden en PayPal');
            }

            $order = $response->json();
            $status = $order['status'] ?? 'UNKNOWN';

            Log::info('📊 Estado actual de la orden', [
                'order_id' => $orderId,
                'status' => $status
            ]);

            // 2. Verificar si ya está capturada
            if ($status === 'COMPLETED') {
                Log::info('✅ Orden ya capturada, extrayendo transaction_id');

                $transactionId = null;
                if (isset($order['purchase_units'][0]['payments']['captures'][0]['id'])) {
                    $transactionId = $order['purchase_units'][0]['payments']['captures'][0]['id'];
                }

                return [
                    'success' => true,
                    'order_id' => $order['id'],
                    'status' => 'COMPLETED',
                    'transaction_id' => $transactionId,
                    'already_captured' => true
                ];
            }

            // 3. Si está APPROVED, capturar el pago
            if ($status === 'APPROVED') {
                Log::info('💳 Orden aprobada, procediendo a capturar');
                return $this->captureOrder($orderId);
            }

            // 4. Otros estados
            Log::warning('⚠️ Estado de orden no esperado', [
                'order_id' => $orderId,
                'status' => $status
            ]);

            return [
                'success' => false,
                'message' => "Estado de orden no esperado: {$status}"
            ];

        } catch (\Exception $e) {
            Log::error('❌ Error en verifyAndCaptureOrder', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * Capturar orden después de aprobación
     */
    public function captureOrder($orderId)
    {
        try {
            $accessToken = $this->getAccessToken();

            Log::info('💳 Capturando orden en PayPal', [
                'order_id' => $orderId
            ]);

            $ch = curl_init();
            
            curl_setopt_array($ch, [
                CURLOPT_URL => "{$this->baseUrl}/v2/checkout/orders/{$orderId}/capture",
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => '{}',
                CURLOPT_HTTPHEADER => [
                    "Authorization: Bearer {$accessToken}",
                    'Content-Type: application/json',
                    'Accept: application/json',
                ],
            ]);
            
            $responseBody = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curlError = curl_error($ch);
            curl_close($ch);

            Log::info('📥 Respuesta de PayPal capture', [
                'http_code' => $httpCode,
                'body' => $responseBody
            ]);

            if ($curlError) {
                Log::error('❌ cURL error', ['error' => $curlError]);
                throw new \Exception("cURL error: {$curlError}");
            }

            $capture = json_decode($responseBody, true);

            if ($httpCode !== 200 && $httpCode !== 201) {
                Log::error('❌ PayPal capture failed', [
                    'http_code' => $httpCode,
                    'body' => $capture
                ]);

                $errorMessage = $capture['message'] ?? 'Error capturing PayPal payment';
                if (isset($capture['details'])) {
                    $errorMessage .= ': ' . json_encode($capture['details']);
                }

                return [
                    'success' => false,
                    'message' => $errorMessage
                ];
            }

            $transactionId = null;
            if (isset($capture['purchase_units'][0]['payments']['captures'][0]['id'])) {
                $transactionId = $capture['purchase_units'][0]['payments']['captures'][0]['id'];
            }

            Log::info('✅ Pago capturado exitosamente', [
                'order_id' => $capture['id'],
                'status' => $capture['status'],
                'transaction_id' => $transactionId
            ]);

            return [
                'success' => true,
                'order_id' => $capture['id'],
                'status' => $capture['status'],
                'transaction_id' => $transactionId,
                'already_captured' => false
            ];

        } catch (\Exception $e) {
            Log::error('❌ PayPal captureOrder exception', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * Obtener detalles de orden
     */
    public function getOrderDetails($orderId)
    {
        try {
            $accessToken = $this->getAccessToken();

            Log::info('🔍 Obteniendo detalles de orden', [
                'order_id' => $orderId
            ]);

            $response = Http::withToken($accessToken)
                ->get("{$this->baseUrl}/v2/checkout/orders/{$orderId}");

            if ($response->failed()) {
                Log::error('❌ Error al obtener detalles', [
                    'status' => $response->status(),
                    'body' => $response->json()
                ]);
                throw new \Exception('Error getting order details');
            }

            return ['success' => true, 'data' => $response->json()];

        } catch (\Exception $e) {
            Log::error('❌ PayPal getOrderDetails error', [
                'message' => $e->getMessage()
            ]);
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }
}