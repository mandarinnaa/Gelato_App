<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $order_id
 * @property string|null $product_type
 * @property int|null $product_id
 * @property int|null $base_product_id
 * @property int|null $custom_product_id
 * @property string|null $product_name
 * @property array|null $product_details
 * @property int $quantity
 * @property float $unit_price
 * @property float $subtotal
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 */
class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'product_type',
        'product_id', // Legacy
        'base_product_id',
        'custom_product_id',
        'product_name',
        'product_details',
        'quantity',
        'unit_price',
        'subtotal',
    ];

    protected $casts = [
        'unit_price' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'product_details' => 'array', // Esto convierte automáticamente JSON <-> Array
    ];

    // ==================== RELACIONES ====================
    
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Legacy: relación antigua con Product
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(BaseProduct::class, 'product_id');
    }

    public function baseProduct(): BelongsTo
    {
        return $this->belongsTo(BaseProduct::class, 'base_product_id');
    }

    public function customProduct(): BelongsTo
    {
        return $this->belongsTo(CustomProduct::class, 'custom_product_id');
    }

    // ==================== MÉTODOS AUXILIARES ====================
    
    /**
     * Calcula el subtotal.
     * 
     * @return float
     */
    public function calculateSubtotal(): float
    {
        return $this->quantity * $this->unit_price;
    }

    /**
     * Actualiza el subtotal.
     */
    public function updateSubtotal(): void
    {
        $this->subtotal = $this->calculateSubtotal();
        $this->save();
    }

    /**
     * Obtiene los detalles del producto para mostrar.
     * 
     * @return array
     */
    public function getProductInfo(): array
    {
        // Base data
        $baseInfo = [
            'name' => $this->product_name ?? 'Producto',
            'quantity' => $this->quantity,
            'unit_price' => (float) $this->unit_price,
            'subtotal' => (float) $this->subtotal,
        ];

        // Si tenemos product_details (snapshot), combinarlos
        if ($this->product_details && is_array($this->product_details)) {
            return array_merge($baseInfo, $this->product_details);
        }

        // Si no hay snapshot, intentamos obtener de las relaciones
        if ($this->product_type === 'base' && $this->baseProduct) {
            return array_merge($baseInfo, [
                'type' => 'base',
                'product_name' => $this->baseProduct->name,
                'flavor' => $this->baseProduct->flavor->name ?? 'N/A',
            ]);
        }

        if ($this->product_type === 'custom' && $this->customProduct) {
            return array_merge($baseInfo, [
                'type' => 'custom',
                'product_name' => 'Producto Personalizado',
                'details' => $this->customProduct->getSummary(),
            ]);
        }

        // Fallback
        return $baseInfo;
    }
}