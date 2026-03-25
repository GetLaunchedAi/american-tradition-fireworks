<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Str;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'sku',
        'title',
        'slug',
        'brand',
        'category',
        'case_pack',
        'caliber',
        'shots',
        'price',
        'compare_at_price',
        'image',
        'youtube_url',
        'description',
        'subtitle',
        'badge',
        'badges',
        'is_featured',
        'is_new',
        'is_on_sale',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'price'            => 'float',
        'compare_at_price' => 'float',
        'badges'           => 'array',
        'is_featured'      => 'boolean',
        'is_new'           => 'boolean',
        'is_on_sale'       => 'boolean',
        'is_active'        => 'boolean',
        'sort_order'       => 'integer',
    ];

    // ---------------------------------------------------------------------------
    // Accessors
    // ---------------------------------------------------------------------------

    public function getImageUrlAttribute(): string
    {
        if (!$this->image) {
            return '/images/placeholder.png';
        }

        if (str_starts_with($this->image, 'http') || str_starts_with($this->image, '/images')) {
            return $this->image;
        }

        return asset('storage/' . $this->image);
    }

    public function getDiscountPercentAttribute(): ?int
    {
        if ($this->price && $this->compare_at_price && $this->compare_at_price > $this->price) {
            return (int) round((1 - $this->price / $this->compare_at_price) * 100);
        }

        return null;
    }

    public function getProductTypeAttribute(): string
    {
        return $this->caliber ? 'pro' : 'consumer';
    }

    // ---------------------------------------------------------------------------
    // Scopes
    // ---------------------------------------------------------------------------

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeFeatured(Builder $query): Builder
    {
        return $query->where('is_featured', true);
    }

    public function scopeByBrand(Builder $query, string $brand): Builder
    {
        return $query->where('brand', $brand);
    }

    public function scopeByCategory(Builder $query, string $category): Builder
    {
        return $query->where('category', 'like', "%{$category}%");
    }

    public function scopeSearch(Builder $query, string $term): Builder
    {
        return $query->where(function ($q) use ($term) {
            $q->where('title', 'like', "%{$term}%")
              ->orWhere('sku', 'like', "%{$term}%")
              ->orWhere('category', 'like', "%{$term}%")
              ->orWhere('description', 'like', "%{$term}%");
        });
    }

    // ---------------------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------------------

    public static function generateSlug(string $title): string
    {
        return Str::slug($title);
    }

    public function relatedProducts(int $limit = 8)
    {
        if (empty($this->category)) {
            return static::active()
                ->where('id', '!=', $this->id)
                ->where('brand', $this->brand)
                ->limit($limit)
                ->get();
        }

        return static::active()
            ->where('id', '!=', $this->id)
            ->where('category', $this->category)
            ->limit($limit)
            ->get();
    }

    /**
     * Return a lightweight array for the public products.json API endpoint.
     */
    public function toApiArray(): array
    {
        return [
            'id'          => $this->id,
            'sku'         => $this->sku,
            'title'       => $this->title,
            'slug'        => $this->slug,
            'brand'       => $this->brand,
            'category'    => $this->category,
            'casePack'    => $this->case_pack,
            'caliber'     => $this->caliber,
            'shots'       => $this->shots,
            'price'       => $this->price,
            'compareAt'   => $this->compare_at_price,
            'youtubeUrl'  => $this->youtube_url,
            'image'       => $this->image_url,
            'description' => $this->description,
            'subtitle'    => $this->subtitle,
            'badge'       => $this->badge,
            'badges'      => $this->badges ?? [],
            'isFeatured'  => $this->is_featured,
            'isNew'       => $this->is_new,
            'isOnSale'    => $this->is_on_sale,
        ];
    }
}
