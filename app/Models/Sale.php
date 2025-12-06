<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $employee_id
 * @property int $payment_method_id
 * @property float $total
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\User $employee
 * @property-read \App\Models\PaymentMethod $paymentMethod
 * @property-read \Illuminate\Database\Eloquent\Collection<\App\Models\SaleItem> $saleItems
 */
class Sale extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'payment_method_id',
        'total',
    ];

    protected $casts = [
        'total' => 'decimal:2',
    ];

    /**
     * Get the employee that registered the sale.
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'employee_id');
    }

    /**
     * Get the payment method for the sale.
     */
    public function paymentMethod(): BelongsTo
    {
        return $this->belongsTo(PaymentMethod::class);
    }

    /**
     * Get the sale items for the sale.
     */
    public function saleItems(): HasMany
    {
        return $this->hasMany(SaleItem::class);
    }

    /**
     * Calculate the total from sale items.
     */
    public function calculateTotal(): float
    {
        return $this->saleItems->sum('subtotal');
    }

    /**
     * Update the sale total.
     */
    public function updateTotal(): void
    {
        $this->total = $this->calculateTotal();
        $this->save();
    }

    /**
     * Scope a query for sales registered by a specific employee.
     */
    public function scopeByEmployee($query, $employeeId)
    {
        return $query->where('employee_id', $employeeId);
    }

    /**
     * Scope a query to get sales from today.
     */
    public function scopeToday($query)
    {
        return $query->whereDate('created_at', today());
    }

    /**
     * Scope a query to get sales from this month.
     */
    public function scopeThisMonth($query)
    {
        return $query->whereMonth('created_at', now()->month)
                     ->whereYear('created_at', now()->year);
    }
}