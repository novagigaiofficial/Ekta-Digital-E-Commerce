<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Wishlist extends Model {
    use HasUuids;
    protected $fillable = ['user_id','session_id','product_id'];
    public function product() { return $this->belongsTo(Product::class); }
}
