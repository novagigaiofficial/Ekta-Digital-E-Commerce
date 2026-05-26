<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class BulkDiscountTier extends Model {
    use HasUuids;
    protected $fillable = ['product_id','min_quantity','discount_pct'];
    protected $casts = ['discount_pct' => 'decimal:2'];
    public function product() { return $this->belongsTo(Product::class); }
}
