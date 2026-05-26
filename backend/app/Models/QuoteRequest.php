<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class QuoteRequest extends Model {
    use HasUuids;
    protected $fillable = ['user_id','company_name','contact_name','phone','email','products_requested','preferred_payment_method','notes','status'];
    protected $casts = ['products_requested' => 'array'];
    public function user() { return $this->belongsTo(User::class); }
}
