<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $name
 * @property int $diameter_cm
 * @property int|null $servings
 * @property float $extra_price
 * @property bool $is_default
 * @property bool $available
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 */
class Size extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'diameter_cm',
        'servings',
        'extra_price',
        'is_default',
        'available',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'extra_price' => 'decimal:2',
        'is_default' => 'boolean',
        'available' => 'boolean',
    ];

    /**
     * Get the base prices for the size.
     */
    public function basePrices(): HasMany
    {
        return $this->hasMany(BasePrice::class);
    }

    /**
     * Scope a query to only include available sizes.
     */
    public function scopeAvailable($query)
    {
        return $query->where('available', true);
    }

    /**
     * Scope a query to get the default size.
     */
    public function scopeDefault($query)
    {
        return $query->where('is_default', true);
    }
}