<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable {
    use HasApiTokens, HasUuids, Notifiable;
    protected $fillable = ['first_name','last_name','email','password','account_type','b2b_status','company_name','business_reg_number','phone','loyalty_points_balance'];
    protected $hidden = ['password', 'remember_token'];
    protected $casts = ['email_verified_at' => 'datetime', 'password' => 'hashed'];
    public function orders() { return $this->hasMany(Order::class); }
    public function loyaltyLedger() { return $this->hasMany(LoyaltyLedger::class); }
    public function quoteRequests() { return $this->hasMany(QuoteRequest::class); }
    public function addresses() { return $this->hasMany(Address::class); }
    public function getFullNameAttribute() { return "{$this->first_name} {$this->last_name}"; }
}
