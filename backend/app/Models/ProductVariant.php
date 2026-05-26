<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class ProductVariant extends Model {
    use HasUuids;
    protected $fillable = ['product_id','sku','size','model','colour','stock_quantity','price_adjustment_tzs'];
    protected $casts = ['price_adjustment_tzs' => 'decimal:2'];
    public function product() { return $this->belongsTo(Product::class); }
    public function getFinalPriceAttribute() { 
        // Uses offer_price_tzs when set, otherwise base_price_tzs
        $base = $this->product->offer_price_tzs ?? $this->product->base_price_tzs;
        return floatval($base) + floatval($this->price_adjustment_tzs);
    }
    public function getIsInStockAttribute() { return $this->stock_quantity > 0; }
}
