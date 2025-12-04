<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $order_id
 * @property int $delivery_status_id
 * @property int|null $changed_by
 * @property string|null $notes
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Order $order
 * @property-read \App\Models\DeliveryStatus $deliveryStatus
 * @property-read \App\Models\User|null $changedBy
 */
class OrderStatusHistory extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'order_status_history';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'order_id',
        'delivery_status_id',
        'changed_by',
        'notes',
    ];

    /**
     * Get the order that owns the status history.
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get the delivery status for the history entry.
     */
    public function deliveryStatus(): BelongsTo
    {
        return $this->belongsTo(DeliveryStatus::class);
    }

    /**
     * Get the user who changed the status.
     */
    public function changedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }

    /**
     * Scope a query to order by most recent first.
     */
    public function scopeRecent($query)
    {
        return $query->orderBy('created_at', 'desc');
    }

    /**
     * Scope a query to filter by delivery status.
     */
    public function scopeByStatus($query, $deliveryStatusId)
    {
        return $query->where('delivery_status_id', $deliveryStatusId);
    }
}