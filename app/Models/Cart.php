<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;

class Cart extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'total',
    ];

    protected $casts = [
        'total' => 'decimal:2',
    ];

    // ==================== RELACIONES ====================
    
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(CartItem::class);
    }

    // ==================== MÉTODOS ====================
    
    /**
     * ✅ Calcular total del carrito correctamente
     */
    public function calculateTotal()
    {
        // 1. Refrescar el modelo desde la base de datos
        $this->refresh();
        
        // 2. Recargar la relación con los items más recientes
        $this->load('items');
        
        // 3. Calcular el total sumando subtotales
        $total = $this->items->sum('subtotal');
        
        // 4. Log para debug (puedes eliminar después)
        Log::info('💰 Cart calculateTotal:', [
            'cart_id' => $this->id,
            'items_count' => $this->items->count(),
            'total_calculado' => $total,
            'items' => $this->items->map(function($item) {
                return [
                    'id' => $item->id,
                    'quantity' => $item->quantity,
                    'unit_price' => $item->unit_price,
                    'subtotal' => $item->subtotal,
                ];
            })
        ]);
        
        // 5. Actualizar sin disparar eventos (para evitar loops infinitos)
        $this->updateQuietly(['total' => $total]);
        
        return $total;
    }

    /**
     * Limpiar carrito
     */
    public function clear()
    {
        $this->items()->delete();
        $this->updateQuietly(['total' => 0]);
    }
}