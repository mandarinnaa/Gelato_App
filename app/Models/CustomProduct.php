<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $user_id
 * @property int|null $order_id
 * @property int $size_id
 * @property int $flavor_id
 * @property int|null $filling_id
 * @property array|null $toppings
 * @property float $final_price
 * @property string $status
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 */
class CustomProduct extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'order_id',
        'size_id',
        'flavor_id',
        'filling_id',
        'toppings',
        'final_price',
        'status'
    ];

    protected $casts = [
        'toppings' => 'array',
        'final_price' => 'decimal:2'
    ];

    // ==================== RELACIONES ====================
    
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function size(): BelongsTo
    {
        return $this->belongsTo(Size::class);
    }

    public function flavor(): BelongsTo
    {
        return $this->belongsTo(Flavor::class);
    }

    public function filling(): BelongsTo
    {
        return $this->belongsTo(Filling::class);
    }

    public function cartItems(): HasMany
    {
        return $this->hasMany(CartItem::class, 'custom_product_id');
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class, 'custom_product_id');
    }

    // ==================== MÉTODOS AUXILIARES ====================
    
    /**
     * Obtiene los objetos completos de los toppings.
     * 
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getToppingsDetails()
    {
        if (!$this->toppings || empty($this->toppings)) {
            return collect();
        }

        return Topping::whereIn('id', $this->toppings)->get();
    }

    /**
     * Calcula el precio del producto personalizado.
     * 
     * @param int $flavorId
     * @param int $sizeId
     * @param int|null $fillingId
     * @param array $toppingIds
     * @return float|null
     */
    public static function calculatePrice($flavorId, $sizeId, $fillingId = null, $toppingIds = []): ?float
    {
        // Precio base por sabor y tamaño
        $basePrice = BasePrice::where('flavor_id', $flavorId)
            ->where('size_id', $sizeId)
            ->first();

        if (!$basePrice) {
            return null;
        }

        $totalPrice = (float) $basePrice->price;

        // Agregar precio del relleno
        if ($fillingId) {
            $filling = Filling::find($fillingId);
            if ($filling && isset($filling->extra_price)) {
                $totalPrice += (float) $filling->extra_price;
            }
        }

        // Agregar precio de toppings
        if (!empty($toppingIds)) {
            $toppings = Topping::whereIn('id', $toppingIds)->get();
            $toppingsPrice = $toppings->sum(function($topping) {
                return (float) ($topping->extra_price ?? 0);
            });
            $totalPrice += $toppingsPrice;
        }

        return round($totalPrice, 2);
    }

    /**
     * Obtiene un resumen legible del producto personalizado.
     * 
     * @return array
     */
    public function getSummary(): array
    {
        return [
            'flavor' => $this->flavor->name,
            'size' => $this->size->name,
            'filling' => $this->filling ? $this->filling->name : 'Sin relleno',
            'toppings' => $this->getToppingsDetails()->pluck('name')->toArray(),
            'price' => $this->final_price
        ];
    }
}