<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Address extends Model {
    use HasUuids;
    protected $fillable = ['user_id','label','full_name','phone','address_line','city','region','is_default'];
    protected $casts = ['is_default' => 'boolean'];
}
