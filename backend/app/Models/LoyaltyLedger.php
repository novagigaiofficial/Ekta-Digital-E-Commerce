<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class LoyaltyLedger extends Model {
    use HasUuids;
    protected $fillable = ['user_id','order_id','points_delta','balance_after','type','note'];
    protected $casts = ['points_delta'=>'integer','balance_after'=>'integer'];
    public function user() { return $this->belongsTo(User::class); }
    public function order() { return $this->belongsTo(Order::class); }
}
