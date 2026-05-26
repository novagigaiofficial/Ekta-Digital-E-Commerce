<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Category extends Model {
    use HasUuids;
    protected $fillable = ['name','slug','image_url','description','is_active','sort_order'];
    protected $casts = ['is_active' => 'boolean'];
    public function products() { return $this->hasMany(Product::class); }
}
