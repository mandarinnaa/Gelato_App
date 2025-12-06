<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $flavor_id
 * @property int $size_id
 * @property float $price
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Flavor $flavor
 * @property-read \App\Models\Size $size
 */
class BasePrice extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'flavor_id',
        'size_id',
        'price',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'price' => 'decimal:2',
    ];

    /**
     * Get the flavor that owns the base price.
     */
    public function flavor(): BelongsTo
    {
        return $this->belongsTo(Flavor::class);
    }

    /**
     * Get the size that owns the base price.
     */
    public function size(): BelongsTo
    {
        return $this->belongsTo(Size::class);
    }
}