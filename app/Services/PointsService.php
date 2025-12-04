<?php
// app/Services/PointsService.php

namespace App\Services;

use App\Models\User;
use App\Models\Order;
use App\Models\PointTransaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PointsService
{
    /**
     * ✅ ACTUALIZADO: Procesar puntos después de una compra exitosa
     * Ahora otorga: 2% sin membresía, 5% Premium, 10% VIP
     */
    public function processOrderPoints(Order $order): void
    {
        try {
            DB::beginTransaction();
            
            $user = $order->user;
            
            // Calcular puntos a otorgar según la nueva configuración
            $pointsToEarn = $user->calculatePointsForPurchase($order->total);
            
            if ($pointsToEarn > 0) {
                $user->addPoints(
                    $pointsToEarn,
                    "Puntos ganados por compra #{$order->id}",
                    $order->id
                );
                
                Log::info('✅ Puntos otorgados por compra', [
                    'user_id' => $user->id,
                    'order_id' => $order->id,
                    'points_earned' => $pointsToEarn,
                    'order_total' => $order->total,
                    'membership' => $user->membership ? $user->membership->name : 'Sin membresía',
                    'percentage' => $user->membership_id == 3 ? '10%' : ($user->membership_id == 2 ? '5%' : '2%')
                ]);
            }
            
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('❌ Error al procesar puntos', [
                'error' => $e->getMessage(),
                'order_id' => $order->id,
                'trace' => $e->getTraceAsString()
            ]);
        }
    }
    
    /**
     * ✅ ACTUALIZADO: Calcular descuento por puntos canjeados
     * Ahora considera el TOTAL INCLUYENDO ENVÍO
     * 1 punto = $1 MXN
     */
    public function calculatePointsDiscount(int $pointsToRedeem, float $orderTotal): float
    {
        // El descuento no puede ser mayor al total de la orden (incluyendo envío)
        $discount = min($pointsToRedeem, $orderTotal);
        
        Log::info('💳 Calculando descuento por puntos', [
            'points_to_redeem' => $pointsToRedeem,
            'order_total' => $orderTotal,
            'discount_calculated' => $discount,
            'note' => 'Incluye costo de envío en el cálculo'
        ]);
        
        return $discount;
    }
    
    /**
     * ✅ ACTUALIZADO: Aplicar canje de puntos a una orden
     * Verifica que no exceda el total INCLUYENDO ENVÍO
     */
    public function redeemPointsForOrder(User $user, int $pointsToRedeem, Order $order): void
    {
        if ($pointsToRedeem <= 0) {
            return;
        }
        
        // Verificar que el usuario tenga suficientes puntos
        // ✅ CORREGIDO: Usar columna 'points' directa para coincidir con User::redeemPoints
        if ($user->points < $pointsToRedeem) {
            throw new \Exception(
                "Puntos insuficientes. Disponibles: {$user->points}, Solicitados: {$pointsToRedeem}"
            );
        }
        
        // ✅ CRÍTICO: Verificar que los puntos no excedan el total de la orden
        // EXCEPCIÓN: Si el total es 0 (orden gratuita cubierta por puntos), permitir el canje
        // Este total YA incluye productos + envío
        if ($order->total > 0 && $pointsToRedeem > $order->total) {
            throw new \Exception(
                "Los puntos a canjear ({$pointsToRedeem}) no pueden exceder el total de la orden ({$order->total})"
            );
        }
        
        DB::beginTransaction();
        
        try {
            $user->redeemPoints(
                $pointsToRedeem,
                "Puntos canjeados en orden #{$order->id}",
                $order->id
            );
            
            Log::info('✅ Puntos canjeados exitosamente', [
                'user_id' => $user->id,
                'order_id' => $order->id,
                'points_redeemed' => $pointsToRedeem,
                'discount_applied' => $pointsToRedeem,
                'remaining_points' => $user->points, // ✅ Usar columna points
                'note' => 'Descuento aplicado sobre total incluyendo envío'
            ]);
            
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('❌ Error al canjear puntos', [
                'error' => $e->getMessage(),
                'user_id' => $user->id,
                'order_id' => $order->id,
                'points_requested' => $pointsToRedeem
            ]);
            throw $e;
        }
    }

    /**
     * Reembolsar puntos por cancelación de orden
     */
    public function refundPointsForOrder(Order $order): void
    {
        // Buscar la transacción de canje para esta orden
        $redemptionTransaction = PointTransaction::where('order_id', $order->id)
            ->where('type', 'redeemed')
            ->first();
        
        if (!$redemptionTransaction) {
            Log::info('ℹ️ No hay puntos para reembolsar', [
                'order_id' => $order->id,
                'reason' => 'No se encontró transacción de canje'
            ]);
            return; // No se canjearon puntos en esta orden
        }
        
        $pointsToRefund = abs($redemptionTransaction->points);
        
        if ($pointsToRefund <= 0) {
            Log::info('ℹ️ No hay puntos para reembolsar', [
                'order_id' => $order->id,
                'reason' => 'Cantidad de puntos es 0'
            ]);
            return;
        }
        
        $user = $order->user;
        
        DB::beginTransaction();
        
        try {
            // Reembolsar puntos al usuario
            $user->refundPoints(
                $pointsToRefund,
                "Reembolso por cancelación de orden #{$order->id}",
                $order->id
            );
            
            Log::info('✅ Puntos reembolsados exitosamente', [
                'user_id' => $user->id,
                'order_id' => $order->id,
                'points_refunded' => $pointsToRefund,
                'new_balance' => $user->fresh()->points
            ]);
            
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('❌ Error al reembolsar puntos', [
                'error' => $e->getMessage(),
                'user_id' => $user->id,
                'order_id' => $order->id,
                'points_to_refund' => $pointsToRefund
            ]);
            throw $e;
        }
    }
    
    /**
     * Expirar puntos vencidos
     */
    public function expirePoints(): int
    {
        $expiredTransactions = PointTransaction::where('type', 'earned')
            ->where('expires_at', '<=', now())
            ->whereDoesntHave('user', function($q) {
                $q->whereRaw('points < 0');
            })
            ->get();
        
        $totalExpired = 0;
        
        foreach ($expiredTransactions as $transaction) {
            $transaction->update(['type' => 'expired']);
            $transaction->user->decrement('points', $transaction->points);
            $totalExpired += $transaction->points;
            
            Log::info('⏰ Puntos expirados', [
                'user_id' => $transaction->user_id,
                'points_expired' => $transaction->points,
                'transaction_id' => $transaction->id
            ]);
        }
        
        if ($totalExpired > 0) {
            Log::info('✅ Proceso de expiración completado', [
                'total_points_expired' => $totalExpired,
                'transactions_affected' => $expiredTransactions->count()
            ]);
        }
        
        return $totalExpired;
    }
    
    /**
     * Obtener balance detallado de puntos del usuario
     */
    public function getUserBalance(User $user): array
    {
        $earned = $user->pointTransactions()
            ->where('type', 'earned')
            ->where(function($q) {
                $q->whereNull('expires_at')
                  ->orWhere('expires_at', '>', now());
            })
            ->sum('points');
        
        $redeemed = abs($user->pointTransactions()
            ->where('type', 'redeemed')
            ->sum('points'));
        
        $expiringSoon = $user->pointTransactions()
            ->where('type', 'earned')
            ->where('expires_at', '>', now())
            ->where('expires_at', '<=', now()->addDays(30))
            ->sum('points');
        
        return [
            'earned' => $earned,
            'redeemed' => $redeemed,
            'available' => max(0, $earned - $redeemed),
            'expiring_soon' => $expiringSoon
        ];
    }
}