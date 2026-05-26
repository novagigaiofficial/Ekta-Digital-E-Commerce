<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Order extends Model {
    use HasUuids;
    protected $fillable = ['order_number','user_id','order_type','status','subtotal_tzs','vat_amount_tzs','discount_tzs','loyalty_points_used','total_tzs','delivery_type','delivery_address','payment_method','payment_status','payment_reference','delivered_at','delivery_confirmed_by','delivery_note'];
    protected $casts = ['delivery_address'=>'array','subtotal_tzs'=>'decimal:2','vat_amount_tzs'=>'decimal:2','discount_tzs'=>'decimal:2','total_tzs'=>'decimal:2','delivered_at'=>'datetime'];
    protected static function boot() {
        parent::boot();
        static::creating(function ($order) {
            // Format: EKT-20260524-A1B2C — date-stamped + random for uniqueness
            do {
                $candidate = 'EKT-' . date('Ymd') . '-' . strtoupper(substr(bin2hex(random_bytes(3)), 0, 6));
            } while (\App\Models\Order::where('order_number', $candidate)->exists());
            $order->order_number = $candidate;
        });
    }
    public function user() { return $this->belongsTo(User::class); }
    public function paymentTransactions() { return $this->hasMany(\App\Models\PaymentTransaction::class); }
    public function latestPayment() { return $this->hasOne(\App\Models\PaymentTransaction::class)->latestOfMany(); }
    public function items() { return $this->hasMany(OrderItem::class); }
}
