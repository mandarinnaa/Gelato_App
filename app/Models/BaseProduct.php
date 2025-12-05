<?php
// app/Models/BaseProduct.php (actualizado)

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Schema;

class BaseProduct extends Model
{
    use HasFactory;

    protected $table = 'base_products';

    protected $fillable = [
        'category_id',
        'name',
        'description',
        'image',
        'flavor_id',
        'size_id',
        'final_price',
        'stock',
        'available',
        'featured',
        'average_rating',
        'total_reviews',
    ];

    protected $casts = [
        'available' => 'boolean',
        'featured' => 'boolean',
        'final_price' => 'decimal:2',
        'stock' => 'integer',
        'average_rating' => 'decimal:1',
        'total_reviews' => 'integer',
    ];

    // ==================== RELACIONES ====================
    
    public function category(): BelongsTo
    {
        return $this->belongsTo(ProductCategory::class, 'category_id');
    }

    public function flavor(): BelongsTo
    {
        return $this->belongsTo(Flavor::class);
    }

    public function images(): HasMany
    {
        if (!Schema::hasTable('base_product_images')) {
            return $this->hasMany(BaseProductImage::class)->whereRaw('1 = 0');
        }
        return $this->hasMany(BaseProductImage::class)->orderBy('order');
    }

    public function primaryImage()
    {
        if (!Schema::hasTable('base_product_images')) {
            return $this->hasOne(BaseProductImage::class)->whereRaw('1 = 0');
        }
        return $this->hasOne(BaseProductImage::class)
            ->where('is_primary', true)
            ->orderBy('order');
    }

    public function cartItems(): HasMany
    {
        return $this->hasMany(CartItem::class, 'base_product_id');
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class, 'base_product_id');
    }

    public function saleItems(): HasMany
    {
        return $this->hasMany(SaleItem::class, 'product_id');
    }

    // ✅ NUEVAS RELACIONES PARA REVIEWS
    public function reviews(): HasMany
    {
        return $this->hasMany(ProductReview::class);
    }

    public function verifiedReviews(): HasMany
    {
        return $this->hasMany(ProductReview::class)
            ->where('verified_purchase', true);
    }

    // ==================== SCOPES ====================
    
    public function scopeAvailable($query)
    {
        return $query->where('available', true);
    }

    public function scopeFeatured($query)
    {
        return $query->where('featured', true);
    }

    public function scopeByCategory($query, $categoryId)
    {
        return $query->where('category_id', $categoryId);
    }

    public function scopeTopRated($query, $minRating = 4.0)
    {
        return $query->where('average_rating', '>=', $minRating)
            ->orderBy('average_rating', 'desc');
    }

    // ==================== MÉTODOS DE PRECIO ====================
    
    public function getPriceForSize($sizeId): ?float
    {
        $basePrice = BasePrice::where('flavor_id', $this->flavor_id)
            ->where('size_id', $sizeId)
            ->first();
        return $basePrice ? (float) $basePrice->price : null;
    }

    public function getAvailableSizes()
    {
        return BasePrice::where('flavor_id', $this->flavor_id)
            ->with('size')
            ->get()
            ->map(function ($basePrice) {
                return [
                    'size_id' => $basePrice->size_id,
                    'size_name' => $basePrice->size->name,
                    'price' => (float) $basePrice->price
                ];
            });
    }

    // ==================== ACCESSORS ====================
    
    public function getImageUrlAttribute(): ?string
    {
        $primaryImage = $this->primaryImage;
        if ($primaryImage) {
            return $primaryImage->image_url;
        }
        
        if (!$this->image) {
            return null;
        }
        
        return Storage::url($this->image);
    }

    public function getImageUrlsAttribute(): array
    {
        return $this->images->map(function ($image) {
            return [
                'id' => $image->id,
                'url' => $image->image_url,
                'is_primary' => $image->is_primary,
                'order' => $image->order,
            ];
        })->toArray();
    }

    // ✅ NUEVOS ACCESSORS PARA RATING STATS
    public function getRatingStatsAttribute(): array
    {
        $reviews = $this->reviews;
        
        $stats = [
            '5' => 0,
            '4' => 0,
            '3' => 0,
            '2' => 0,
            '1' => 0,
        ];

        foreach ($reviews as $review) {
            $rating = floor($review->rating);
            if (isset($stats[(string)$rating])) {
                $stats[(string)$rating]++;
            }
        }

        return $stats;
    }
}