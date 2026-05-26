<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class HeroSlide extends Model {
    use HasUuids;
    protected $fillable = ['tag','headline','sub','cta_text','cta_href','image_url','bg_color','sort_order','is_active'];
    protected $casts = ['is_active' => 'boolean'];
}
