<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model {
    use HasUuids;
    protected $fillable = ['order_id','variant_id','quantity','unit_price_tzs','bulk_discount_pct','line_total_tzs'];
    protected $casts = ['unit_price_tzs'=>'decimal:2','bulk_discount_pct'=>'decimal:2','line_total_tzs'=>'decimal:2'];
    public function order() { return $this->belongsTo(Order::class); }
    public function variant() { return $this->belongsTo(ProductVariant::class); }
}
