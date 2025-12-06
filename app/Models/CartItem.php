<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CartItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'cart_id',
        'product_type', // 'base' o 'custom'
        'product_id', // Legacy - mantener para compatibilidad
        'base_product_id',
        'custom_product_id',
        'size_id', // Para productos base
        'quantity',
        'unit_price',
        'subtotal',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'unit_price' => 'decimal:2',
        'subtotal' => 'decimal:2',
    ];

    // ==================== RELACIONES ====================
    
    public function cart(): BelongsTo
    {
        return $this->belongsTo(Cart::class);
    }

    /**
     * Legacy: relación antigua con Product (ahora BaseProduct)
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

    public function size(): BelongsTo
    {
        return $this->belongsTo(Size::class);
    }

    // ==================== MÉTODOS AUXILIARES ====================
    
    /**
     * Obtiene el producto correcto según el tipo.
     * 
     * @return BaseProduct|CustomProduct|null
     */
    public function getProduct()
    {
        if ($this->product_type === 'base') {
            return $this->baseProduct;
        } elseif ($this->product_type === 'custom') {
            return $this->customProduct;
        }
        
        // Legacy: si no tiene product_type pero tiene product_id
        if ($this->product_id) {
            return $this->product;
        }
        
        return null;
    }

    /**
     * Calcula el subtotal del item.
     * 
     * @return float
     */
    public function getSubtotalAmount(): float
    {
        return $this->unit_price * $this->quantity;
    }

    /**
     * Obtiene los detalles completos del item para mostrar en UI.
     * 
     * @return array
     */
    public function getDetails(): array
    {
        // Base de datos común para todos los tipos
        $baseDetails = [
            'id' => $this->id,  // ✅ CRÍTICO: ID del CartItem para editar/eliminar
            'quantity' => $this->quantity,
            'unit_price' => (float) $this->unit_price,
            'subtotal' => (float) $this->subtotal
        ];

        if ($this->product_type === 'base' && $this->baseProduct) {
            $product = $this->baseProduct;
            $size = $this->size;
            
            return array_merge($baseDetails, [
                'type' => 'base',
                'name' => $product->name,
                'image' => $product->image_url,
                'flavor' => $product->flavor->name,
                'size' => $size ? $size->name : 'N/A',
                'category' => $product->category->name,
                'product' => [  // ✅ Info del producto para la UI
                    'id' => $product->id,
                    'name' => $product->name,
                    'stock' => $product->stock,
                ]
            ]);
        } 
        
        if ($this->product_type === 'custom' && $this->customProduct) {
            $custom = $this->customProduct;
            
            return array_merge($baseDetails, [
                'type' => 'custom',
                'name' => 'Producto Personalizado',
                'flavor' => $custom->flavor->name,
                'size' => $custom->size->name,
                'filling' => $custom->filling ? $custom->filling->name : 'Sin relleno',
                'toppings' => $custom->getToppingsDetails()->pluck('name')->toArray(),
                'product' => [  // ✅ Info básica para consistencia
                    'id' => $custom->id,
                    'name' => 'Producto Personalizado',
                ]
            ]);
        }

        // Legacy o error
        return array_merge($baseDetails, [
            'type' => 'unknown',
            'name' => 'Producto no encontrado',
            'product' => null
        ]);
    }

    // ==================== EVENTOS DEL MODELO ====================
    
    protected static function boot()
    {
        parent::boot();

        // Calcular subtotal automáticamente al guardar
        static::saving(function ($cartItem) {
            $cartItem->subtotal = $cartItem->unit_price * $cartItem->quantity;
        });

        // Recalcular total del carrito después de guardar
        // static::saved(function ($cartItem) {
        //     if ($cartItem->cart) {
        //         $cartItem->cart->calculateTotal();
        //     }
        // });

        // Recalcular total del carrito después de eliminar
        static::deleted(function ($cartItem) {
            if ($cartItem->cart) {
                $cartItem->cart->calculateTotal();
            }
        });
    }
}