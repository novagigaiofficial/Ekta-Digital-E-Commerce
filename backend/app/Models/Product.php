<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Product extends Model {
    use HasUuids;
    protected $fillable = ['category_id','name','slug','description','short_description','brand','base_price_tzs','offer_price_tzs','vat_rate','video_url','images','tags','is_featured','is_new_arrival','is_top_seller','total_sold','status'];
    protected $casts = ['images'=>'array','tags'=>'array','is_featured'=>'boolean','is_new_arrival'=>'boolean','is_top_seller'=>'boolean','base_price_tzs'=>'decimal:2','offer_price_tzs'=>'decimal:2','vat_rate'=>'decimal:2'];
    public function category() { return $this->belongsTo(Category::class); }
    public function variants() { return $this->hasMany(ProductVariant::class); }
    public function bulkDiscountTiers() { return $this->hasMany(BulkDiscountTier::class); }
    public function getFormattedPriceAttribute() { return 'TZS '.number_format($this->base_price_tzs, 0, '.', ','); }
    public function getEffectivePriceAttribute() { return $this->offer_price_tzs ?? $this->base_price_tzs; }
}
