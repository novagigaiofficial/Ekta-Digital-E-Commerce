<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class InvoiceTemplate extends Model {
    protected $fillable = ['business_name','business_address','business_phone','business_email','business_website','business_logo','footer_note','bank_details','primary_color'];
}
