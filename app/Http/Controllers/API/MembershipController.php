<?php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Membership;
use App\Services\PayPalService;
use App\Http\Requests\StoreMembershipRequest;
use App\Http\Requests\UpdateMembershipRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class MembershipController extends Controller
{
    protected $paypalService;

    public function __construct(PayPalService $paypalService)
    {
        $this->paypalService = $paypalService;
    }

    /**
     * Display a listing of memberships.
     */
    public function index()
    {
        $memberships = Membership::withCount('users')->get();
        
        return response()->json([
            'success' => true,
            'data' => $memberships
        ], 200);
    }

    /**
     * Store a newly created membership.
     */
    public function store(StoreMembershipRequest $request)
    {
        $membership = Membership::create($request->validated());
        
        return response()->json([
            'success' => true,
            'message' => 'Membresía creada exitosamente',
            'data' => $membership
        ], 201);
    }

    /**
     * Display the specified membership.
     */
    public function show(Membership $membership)
    {
        return response()->json([
            'success' => true,
            'data' => $membership->load('users')
        ], 200);
    }

    /**
     * Update the specified membership.
     */
    public function update(UpdateMembershipRequest $request, Membership $membership)
    {
        $membership->update($request->validated());
        
        return response()->json([
            'success' => true,
            'message' => 'Membresía actualizada exitosamente',
            'data' => $membership
        ], 200);
    }

    /**
     * ✅ NUEVO: Crear orden de PayPal para membresía
     */
    public function createPayPalOrder(Request $request, Membership $membership)
    {
        try {
            $user = $request->user();

            // Validar que no tenga ya esta membresía
            if ($user->membership_id === $membership->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ya tienes esta membresía activa'
                ], 400);
            }

            Log::info('💳 Creando orden de PayPal para membresía', [
                'user_id' => $user->id,
                'membership_id' => $membership->id,
                'membership_name' => $membership->name,
                'price' => $membership->price
            ]);

            // Crear orden en PayPal
            $result = $this->paypalService->createOrder([
                'total' => floatval($membership->price),
                'description' => "Membresía {$membership->name} - {$membership->discount_percent}% descuento",
                'is_membership' => true // ← Indicador para usar URL de retorno correcta
            ]);

            if ($result['success']) {
                Log::info('✅ Orden de PayPal creada para membresía', [
                    'order_id' => $result['order_id'],
                    'approval_url' => $result['approval_url']
                ]);

                return response()->json([
                    'success' => true,
                    'order_id' => $result['order_id'],
                    'approval_url' => $result['approval_url']
                ]);
            }

            Log::error('❌ Error al crear orden de PayPal para membresía', [
                'message' => $result['message'] ?? 'Error desconocido'
            ]);

            return response()->json([
                'success' => false,
                'message' => $result['message'] ?? 'Error al crear orden'
            ], 400);

        } catch (\Exception $e) {
            Log::error('❌ Excepción al crear orden de PayPal para membresía', [
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
     * ✅ ACTUALIZADO: Upgrade user membership (después de confirmar pago).
     * Ahora permite actualizar incluso si ya tiene la membresía (por si se ejecuta dos veces)
     */
    public function upgrade(Request $request, Membership $membership)
    {
        try {
            $user = $request->user();
            
            // ✅ CAMBIO: Si ya tiene esta membresía, devolver éxito sin error
            if ($user->membership_id === $membership->id) {
                Log::info('ℹ️ Usuario ya tiene esta membresía activa', [
                    'user_id' => $user->id,
                    'membership_id' => $membership->id
                ]);

                // Recargar relaciones y devolver datos actuales
                $user->load(['membership', 'role']);

                return response()->json([
                    'success' => true,
                    'message' => 'Membresía ya está activa',
                    'data' => $user,
                    'membership' => [
                        'id' => $membership->id,
                        'name' => $membership->name,
                        'price' => $membership->price,
                        'discount_percent' => $membership->discount_percent,
                        'points_multiplier' => $membership->points_multiplier,
                        'min_spent' => $membership->min_spent
                    ]
                ], 200);
            }

            Log::info('🔄 Actualizando membresía del usuario', [
                'user_id' => $user->id,
                'old_membership_id' => $user->membership_id,
                'new_membership_id' => $membership->id
            ]);

            // Actualizar la membresía del usuario
            $user->membership_id = $membership->id;
            
            // Establecer fecha de expiración (30 días desde ahora)
            $user->membership_expires_at = Carbon::now()->addDays(30);
            $user->membership_cancelled_at = null; // Limpiar cancelación si existía
            $user->membership_auto_renew = true; // Activar renovación automática
            
            $user->save();

            // Recargar las relaciones para devolver datos completos
            $user->load(['membership', 'role']);
            
            Log::info('✅ Membresía actualizada exitosamente', [
                'user_id' => $user->id,
                'membership_id' => $membership->id,
                'membership_name' => $membership->name
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Membresía actualizada exitosamente',
                'data' => $user,
                'membership' => [
                    'id' => $membership->id,
                    'name' => $membership->name,
                    'price' => $membership->price,
                    'discount_percent' => $membership->discount_percent,
                    'points_multiplier' => $membership->points_multiplier,
                    'min_spent' => $membership->min_spent
                ]
            ], 200);

        } catch (\Exception $e) {
            Log::error('❌ Error al actualizar membresía', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar membresía'
            ], 500);
        }
    }

    /**
     * Get current user's membership details
     */
    public function getCurrentMembership(Request $request)
    {
        try {
            $user = $request->user();
            
            if (!$user->membership_id) {
                return response()->json([
                    'success' => true,
                    'has_membership' => false,
                    'message' => 'No tienes una membresía activa'
                ], 200);
            }

            $user->load('membership');

            return response()->json([
                'success' => true,
                'has_membership' => true,
                'data' => [
                    'membership' => $user->membership,
                    'expires_at' => $user->membership_expires_at,
                    'cancelled_at' => $user->membership_cancelled_at,
                    'auto_renew' => $user->membership_auto_renew,
                    'is_expired' => $user->membershipIsExpired(),
                    'is_cancelled' => $user->membershipIsCancelled(),
                    'days_remaining' => $user->membershipDaysRemaining(),
                    'can_cancel' => $user->canCancelMembership(),
                    'can_reactivate' => $user->canReactivateMembership(),
                ]
            ], 200);

        } catch (\Exception $e) {
            Log::error('❌ Error al obtener membresía actual', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al obtener información de membresía'
            ], 500);
        }
    }

    /**
     * Cancel user's membership (soft cancellation)
     */
    public function cancelMembership(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user->canCancelMembership()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No puedes cancelar tu membresía en este momento'
                ], 400);
            }

            Log::info('🚫 Cancelando membresía', [
                'user_id' => $user->id,
                'membership_id' => $user->membership_id
            ]);

            // Soft cancellation: marcar como cancelada pero mantener activa hasta expiración
            $user->membership_cancelled_at = Carbon::now();
            $user->membership_auto_renew = false;
            $user->save();

            Log::info('✅ Membresía cancelada exitosamente', [
                'user_id' => $user->id,
                'expires_at' => $user->membership_expires_at
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Membresía cancelada. Seguirá activa hasta ' . $user->membership_expires_at->format('d/m/Y'),
                'data' => [
                    'cancelled_at' => $user->membership_cancelled_at,
                    'expires_at' => $user->membership_expires_at,
                    'days_remaining' => $user->membershipDaysRemaining()
                ]
            ], 200);

        } catch (\Exception $e) {
            Log::error('❌ Error al cancelar membresía', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al cancelar membresía'
            ], 500);
        }
    }

    /**
     * Reactivate a cancelled membership
     */
    public function reactivateMembership(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user->canReactivateMembership()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No puedes reactivar tu membresía en este momento'
                ], 400);
            }

            Log::info('🔄 Reactivando membresía', [
                'user_id' => $user->id,
                'membership_id' => $user->membership_id
            ]);

            // Reactivar membresía
            $user->membership_cancelled_at = null;
            $user->membership_auto_renew = true;
            $user->save();

            Log::info('✅ Membresía reactivada exitosamente', [
                'user_id' => $user->id,
                'expires_at' => $user->membership_expires_at
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Membresía reactivada exitosamente',
                'data' => [
                    'auto_renew' => $user->membership_auto_renew,
                    'expires_at' => $user->membership_expires_at,
                    'days_remaining' => $user->membershipDaysRemaining()
                ]
            ], 200);

        } catch (\Exception $e) {
            Log::error('❌ Error al reactivar membresía', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al reactivar membresía'
            ], 500);
        }
    }

    /**
     * Remove the specified membership.
     */
    public function destroy(Membership $membership)
    {
        // Remover la membresía de todos los usuarios que la tienen
        $membership->users()->update(['membership_id' => null]);
        $membership->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Membresía eliminada exitosamente'
        ], 200);
    }
}