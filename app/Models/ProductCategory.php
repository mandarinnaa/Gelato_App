<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $name
 * @property string|null $description
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<\App\Models\BaseProduct> $baseProducts
 */
class ProductCategory extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'description',
    ];

    /**
     * Get the base products for the category.
     */
    public function baseProducts(): HasMany
    {
        return $this->hasMany(BaseProduct::class, 'category_id');
    }

    /**
     * Legacy: Mantener por compatibilidad temporal
     * @deprecated Use baseProducts() instead
     */
    public function products(): HasMany
    {
        return $this->hasMany(BaseProduct::class, 'category_id');
    }

    /**
     * Get the count of base products in this category.
     */
    public function getBaseProductsCountAttribute(): int
    {
        return $this->baseProducts()->count();
    }

    /**
     * Get available base products in this category.
     */
    public function availableBaseProducts()
    {
        return $this->baseProducts()->where('available', true);
    }

    /**
     * Legacy method - redirects to baseProducts
     * @deprecated
     */
    public function availableProducts()
    {
        return $this->availableBaseProducts();
    }
}