<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Promotion extends Model {
    use HasUuids;
    protected $fillable = ['name','type','discount_code','discount_value','applies_to','applies_to_id','start_date','end_date','is_active'];
    protected $casts = ['discount_value'=>'decimal:2','is_active'=>'boolean','start_date'=>'datetime','end_date'=>'datetime'];
    public function getIsCurrentlyActiveAttribute() {
        $now = now();
        return $this->is_active && (!$this->start_date || $this->start_date <= $now) && (!$this->end_date || $this->end_date >= $now);
    }
}
