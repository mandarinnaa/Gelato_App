<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Membership extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'price',
        'discount_percent',
        'points_multiplier',
        'min_spent',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'price' => 'decimal:2',
        'discount_percent' => 'decimal:2',
        'points_multiplier' => 'decimal:2',
        'min_spent' => 'decimal:2',
    ];

    /**
     * Get the users for the membership.
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}