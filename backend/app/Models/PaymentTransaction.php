<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class PaymentTransaction extends Model
{
    use HasUuids;
    protected $fillable = [
        'order_id','gateway','gateway_ref','gateway_order_ref',
        'status','amount','currency','gateway_response','payment_url','paid_at',
    ];
    protected $casts = [
        'gateway_response' => 'array',
        'amount'           => 'decimal:2',
        'paid_at'          => 'datetime',
    ];
    public function order() { return $this->belongsTo(Order::class); }
}
