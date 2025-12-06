<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $user_id
 * @property int|null $delivery_person_id
 * @property int $address_id
 * @property int $payment_method_id
 * @property int $delivery_status_id
 * @property float $total
 * @property string|null $paypal_order_id
 * @property string|null $paypal_transaction_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\User $user
 * @property-read \App\Models\User|null $deliveryPerson
 * @property-read \App\Models\Address $address
 * @property-read \App\Models\PaymentMethod $paymentMethod
 * @property-read \App\Models\DeliveryStatus $deliveryStatus
 * @property-read \Illuminate\Database\Eloquent\Collection<\App\Models\OrderItem> $orderItems
 * @property-read \Illuminate\Database\Eloquent\Collection<\App\Models\OrderStatusHistory> $statusHistory
 */
class Order extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'delivery_person_id',
        'address_id',
        'payment_method_id',
        'delivery_status_id',
        'total',
        'paypal_order_id',
        'paypal_transaction_id',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'total' => 'decimal:2',
    ];

    /**
     * Get the user (client) that owns the order.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the delivery person assigned to the order.
     */
    public function deliveryPerson(): BelongsTo
    {
        return $this->belongsTo(User::class, 'delivery_person_id');
    }

    /**
     * Get the address for the order.
     */
    public function address(): BelongsTo
    {
        return $this->belongsTo(Address::class);
    }

    /**
     * Get the payment method for the order.
     */
    public function paymentMethod(): BelongsTo
    {
        return $this->belongsTo(PaymentMethod::class);
    }

    /**
     * Get the delivery status for the order.
     */
    public function deliveryStatus(): BelongsTo
    {
        return $this->belongsTo(DeliveryStatus::class);
    }

    /**
     * Get the order items for the order.
     */
    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Get the status history for the order.
     */
    public function statusHistory(): HasMany
    {
        return $this->hasMany(OrderStatusHistory::class)->orderBy('created_at', 'desc');
    }

    /**
     * Scope a query to filter by delivery status.
     */
    public function scopeByStatus($query, $deliveryStatusId)
    {
        return $query->where('delivery_status_id', $deliveryStatusId);
    }

    /**
     * Scope a query to only include pending orders.
     */
    public function scopePendiente($query)
    {
        return $query->whereHas('deliveryStatus', function($q) {
            $q->where('name', 'pendiente');
        });
    }

    /**
     * Scope a query to only include preparing orders.
     */
    public function scopePreparando($query)
    {
        return $query->whereHas('deliveryStatus', function($q) {
            $q->where('name', 'preparando');
        });
    }

    /**
     * Scope a query to only include in delivery orders.
     */
    public function scopeEnCamino($query)
    {
        return $query->whereHas('deliveryStatus', function($q) {
            $q->where('name', 'en_camino');
        });
    }

    /**
     * Scope a query to only include delivered orders.
     */
    public function scopeEntregado($query)
    {
        return $query->whereHas('deliveryStatus', function($q) {
            $q->where('name', 'entregado');
        });
    }

    /**
     * Scope a query to only include cancelled orders.
     */
    public function scopeCancelado($query)
    {
        return $query->whereHas('deliveryStatus', function($q) {
            $q->where('name', 'cancelado');
        });
    }

    /**
     * Scope a query for orders assigned to a specific delivery person.
     */
    public function scopeAssignedTo($query, $deliveryPersonId)
    {
        return $query->where('delivery_person_id', $deliveryPersonId);
    }

    /**
     * Check if the order is pending.
     */
    public function isPending(): bool
    {
        return $this->deliveryStatus->name === 'pendiente';
    }

    /**
     * Check if the order is being prepared.
     */
    public function isPreparing(): bool
    {
        return $this->deliveryStatus->name === 'preparando';
    }

    /**
     * Check if the order is in delivery.
     */
    public function isInDelivery(): bool
    {
        return $this->deliveryStatus->name === 'en_camino';
    }

    /**
     * Check if the order is delivered.
     */
    public function isDelivered(): bool
    {
        return $this->deliveryStatus->name === 'entregado';
    }

    /**
     * Check if the order is cancelled.
     */
    public function isCancelled(): bool
    {
        return $this->deliveryStatus->name === 'cancelado';
    }

    /**
     * Calculate the total from order items.
     */
    public function calculateTotal(): float
    {
        return $this->orderItems->sum('subtotal');
    }

    /**
     * Update the order total.
     */
    public function updateTotal(): void
    {
        $this->total = $this->calculateTotal();
        $this->save();
    }

    /**
     * Change the order status and log it in history.
     */
    public function changeStatus(int $newDeliveryStatusId, ?int $changedBy = null, ?string $notes = null): void
    {
        $this->delivery_status_id = $newDeliveryStatusId;
        $this->save();

        $this->statusHistory()->create([
            'delivery_status_id' => $newDeliveryStatusId,
            'changed_by' => $changedBy,
            'notes' => $notes,
        ]);
    }

    /**
     * Get the latest status from history.
     */
    public function getLatestStatusHistory()
    {
        return $this->statusHistory()->latest('created_at')->first();
    }

        /**
     * Relación con transacciones de pago
     */
    public function paymentTransactions()
    {
        return $this->hasMany(PaymentTransaction::class);
    }

    /**
     * Obtener la transacción principal
     */
    public function mainTransaction()
    {
        return $this->hasOne(PaymentTransaction::class)->latest();
    }

    /**
     * Get the messages for the order.
     */
    public function messages(): HasMany
    {
        return $this->hasMany(Message::class);
    }
}