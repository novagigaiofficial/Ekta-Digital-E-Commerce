<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class OtpVerification extends Model {
    use HasUuids;
    protected $fillable = ['phone_or_email','otp','purpose','is_used','expires_at'];
    protected $casts = ['expires_at'=>'datetime','is_used'=>'boolean'];
}
