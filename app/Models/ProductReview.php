<?php
// app/Models/ProductReview.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductReview extends Model
{
    use HasFactory;

    protected $fillable = [
        'base_product_id',
        'user_id',
        'order_id',
        'rating',
        'comment',
        'verified_purchase',
    ];

    protected $casts = [
        'rating' => 'decimal:1',
        'verified_purchase' => 'boolean',
    ];

    protected $appends = ['created_at_human'];

    // ==================== RELACIONES ====================

    public function baseProduct(): BelongsTo
    {
        return $this->belongsTo(BaseProduct::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    // ==================== ACCESSORS ====================

    public function getCreatedAtHumanAttribute(): string
    {
        return $this->created_at->locale('es')->diffForHumans();
    }

    // ==================== MÉTODOS ESTÁTICOS ====================

    /**
     * Verificar si el usuario puede dejar reseña para este producto
     */
    public static function canUserReview(int $userId, int $productId): bool
    {
        // Verificar si ya dejó una reseña
        $existingReview = self::where('user_id', $userId)
            ->where('base_product_id', $productId)
            ->exists();

        if ($existingReview) {
            return false;
        }

        // Verificar si ha comprado el producto
        $hasPurchased = OrderItem::whereHas('order', function ($query) use ($userId) {
            $query->where('user_id', $userId)
                  ->where('delivery_status_id', 4); // Entregado
        })->where('base_product_id', $productId)
          ->exists();

        return $hasPurchased;
    }

    /**
     * Actualizar estadísticas del producto después de crear/actualizar/eliminar reseña
     */
    public static function updateProductStats(int $productId): void
    {
        $stats = self::where('base_product_id', $productId)
            ->selectRaw('AVG(rating) as avg_rating, COUNT(*) as total')
            ->first();

        BaseProduct::where('id', $productId)->update([
            'average_rating' => round($stats->avg_rating ?? 0, 1),
            'total_reviews' => $stats->total ?? 0,
        ]);
    }
}