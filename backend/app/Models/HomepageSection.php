<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class HomepageSection extends Model {
    use HasUuids;
    protected $fillable = ['type','title','sort_order','is_visible','config'];
    protected $casts = ['is_visible'=>'boolean','config'=>'array'];
}
