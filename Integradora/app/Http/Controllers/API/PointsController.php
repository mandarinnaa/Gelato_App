<?php
// app/Http/Controllers/API/PointsController.php - ACTUALIZADO
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\PointTransaction;
use App\Services\PointsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PointsController extends Controller
{
    protected $pointsService;
    
    public function __construct(PointsService $pointsService)
    {
        $this->pointsService = $pointsService;
    }
    
    /**
     * Obtener balance de puntos del usuario
     */
    public function balance(Request $request)
    {
        $user = $request->user();
        
        // Puntos ganados (válidos)
        $earned = $user->pointTransactions()
            ->where('type', 'earned')
            ->where(function($q) {
                $q->whereNull('expires_at')
                  ->orWhere('expires_at', '>', now());
            })
            ->sum('points');
        
        // Puntos canjeados
        $redeemed = abs($user->pointTransactions()
            ->where('type', 'redeemed')
            ->sum('points'));
        
        // Balance disponible (Usar columna directa de BD para coincidir con perfil)
        $available = $user->points;
        
        // Puntos próximos a expirar (30 días)
        $expiringSoon = $user->pointTransactions()
            ->where('type', 'earned')
            ->where('expires_at', '>', now())
            ->where('expires_at', '<=', now()->addDays(30))
            ->sum('points');
        
        // ✅ ACTUALIZADO: Calcular % para siguiente membresía
        $membershipProgress = $this->calculateMembershipProgress($user);
        
        return response()->json([
            'success' => true,
            'data' => [
                'available' => $available,
                'earned_total' => $earned,
                'redeemed_total' => $redeemed,
                'expiring_soon' => $expiringSoon,
                'membership' => [
                    'current' => $user->membership ? $user->membership->name : 'Sin membresía',
                    'points_percentage' => $user->membership_id == 3 ? 10 : ($user->membership_id == 2 ? 5 : 2),
                    'discount_percent' => $user->membership ? floatval($user->membership->discount_percent) : 0,
                    'progress' => $membershipProgress
                ]
            ]
        ], 200);
    }
    
    /**
     * Historial de transacciones de puntos
     */
    public function history(Request $request)
    {
        $perPage = $request->get('per_page', 20);
        
        $transactions = $request->user()
            ->pointTransactions()
            ->with('order')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
        
        $formatted = $transactions->map(function($transaction) {
            return [
                'id' => $transaction->id,
                'type' => $transaction->type,
                'points' => $transaction->points,
                'amount' => $transaction->amount ? floatval($transaction->amount) : null,
                'description' => $transaction->description,
                'order_id' => $transaction->order_id,
                'order_number' => $transaction->order ? "#" . $transaction->order->id : null,
                'expires_at' => $transaction->expires_at?->toDateTimeString(),
                'created_at' => $transaction->created_at->toDateTimeString()
            ];
        });
        
        return response()->json([
            'success' => true,
            'data' => $formatted,
            'pagination' => [
                'current_page' => $transactions->currentPage(),
                'last_page' => $transactions->lastPage(),
                'per_page' => $transactions->perPage(),
                'total' => $transactions->total()
            ]
        ], 200);
    }
    
/**
 * ✅ ACTUALIZADO: Calcular descuento por puntos para checkout
 * Ahora considera el total CON ENVÍO
 */
public function calculateDiscount(Request $request)
{
    $validated = $request->validate([
        'points' => 'required|integer|min:1',
        'cart_total' => 'required|numeric|min:0'
    ]);
    
    $user = $request->user();
    
    // Usar columna points directa para coincidir con el perfil
    if ($user->points < $validated['points']) {
        return response()->json([
            'success' => false,
            'message' => 'Puntos insuficientes',
            'available_points' => $user->points
        ], 400);
    }
    
    // ✅ El cart_total que llega desde el frontend YA incluye el envío
    $discount = $this->pointsService->calculatePointsDiscount(
        $validated['points'],
        $validated['cart_total'] // ← Incluye productos + envío
    );
    
    $newTotal = max(0, $validated['cart_total'] - $discount);
    
    return response()->json([
        'success' => true,
        'data' => [
            'points_to_redeem' => $validated['points'],
            'discount_amount' => $discount,
            'original_total' => $validated['cart_total'],
            'new_total' => $newTotal,
            'remaining_points' => $user->points - $validated['points'],
            'note' => 'Descuento aplicado sobre total incluyendo envío'
        ]
    ], 200);
}    
    /**
     * Calcular progreso hacia siguiente membresía
     */
    private function calculateMembershipProgress($user)
    {
        if (!$user->membership) {
            return [
                'next_tier' => 'Premium',
                'required_spent' => 1000,
                'current_spent' => 0,
                'progress_percent' => 0
            ];
        }
        
        // Si es VIP (máximo nivel), no hay siguiente
        if ($user->membership->id == 3) {
            return [
                'next_tier' => null,
                'message' => '¡Máximo nivel alcanzado!'
            ];
        }
        
        // Si es Premium, calcular progreso a VIP
        if ($user->membership->id == 2) {
            $totalSpent = $user->orders()->where('delivery_status_id', 4)->sum('total');
            $required = 3000;
            
            return [
                'next_tier' => 'VIP',
                'required_spent' => $required,
                'current_spent' => floatval($totalSpent),
                'progress_percent' => min(100, ($totalSpent / $required) * 100)
            ];
        }
        
        return null;
    }
    
    /**
     * ✅ ACTUALIZADO: Obtener información de cómo ganar puntos
     */
    public function earnInfo(Request $request)
    {
        $user = $request->user();
        
        // Calcular ejemplos de puntos a ganar
        $examples = [
            100 => $user->calculatePointsForPurchase(100),
            500 => $user->calculatePointsForPurchase(500),
            1000 => $user->calculatePointsForPurchase(1000),
            2000 => $user->calculatePointsForPurchase(2000)
        ];
        
        $currentPercentage = match($user->membership_id) {
            3 => 10,
            2 => 5,
            default => 2
        };
        
        return response()->json([
            'success' => true,
            'data' => [
                'current_rate' => [
                    'membership' => $user->membership ? $user->membership->name : 'Sin membresía',
                    'percentage' => $currentPercentage,
                    'description' => "Ganas {$currentPercentage}% en puntos por cada compra"
                ],
                'examples' => $examples,
                'rules' => [
                    '✅ Sin membresía: 2% en puntos',
                    '✅ Membresía Premium: 5% en puntos',
                    '✅ Membresía VIP: 10% en puntos',
                    '✅ 1 punto = $1 MXN de descuento',
                    '✅ SIN LÍMITE de canje - usa todos tus puntos',
                    '⏰ Los puntos expiran después de 1 año'
                ],
                'redemption_info' => [
                    'max_redemption' => 'Sin límite - puedes usar todos tus puntos disponibles',
                    'available_points' => $user->points,
                    'max_discount' => "Puedes obtener hasta $" . $user->points . " MXN de descuento"
                ]
            ]
        ], 200);
    }
}