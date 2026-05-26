<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Promotion;
use Illuminate\Http\Request;

class PromotionController extends Controller {
    public function active() {
        return response()->json(
            Promotion::where('is_active',true)
                ->where(fn($q)=>$q->whereNull('start_date')->orWhere('start_date','<=',now()))
                ->where(fn($q)=>$q->whereNull('end_date')->orWhere('end_date','>=',now()))
                ->get()
        );
    }

    public function index() {
        return response()->json(Promotion::orderBy('created_at','desc')->paginate(20));
    }

    public function store(Request $request) {
        $request->validate([
            'name'           => 'required|string|max:255',
            'type'           => 'required|in:percentage,fixed,code',
            'discount_value' => 'required|numeric|min:0',
            'discount_code'  => 'nullable|string|unique:promotions,discount_code',
            'applies_to'     => 'in:all,category,product',
            'applies_to_id'  => 'nullable|uuid',
            'start_date'     => 'nullable|date',
            'end_date'       => 'nullable|date|after_or_equal:start_date',
            'is_active'      => 'boolean',
        ]);
        $data = $request->only(['name','type','discount_value','discount_code','applies_to','applies_to_id','start_date','end_date','is_active']);
        if (isset($data['discount_code'])) $data['discount_code'] = strtoupper($data['discount_code']);
        return response()->json(Promotion::create($data), 201);
    }

    public function update(Request $request, $id) {
        $promo = Promotion::findOrFail($id);
        $request->validate([
            'name'           => 'sometimes|string|max:255',
            'discount_value' => 'sometimes|numeric|min:0',
            'discount_code'  => 'nullable|string|unique:promotions,discount_code,'.$id,
            'start_date'     => 'nullable|date',
            'end_date'       => 'nullable|date',
            'is_active'      => 'boolean',
        ]);
        $data = $request->only(['name','type','discount_value','discount_code','applies_to','applies_to_id','start_date','end_date','is_active']);
        if (isset($data['discount_code'])) $data['discount_code'] = strtoupper($data['discount_code']);
        $promo->update($data);
        return response()->json($promo);
    }

    public function destroy($id) {
        Promotion::findOrFail($id)->delete();
        return response()->json(['message'=>'Promotion deleted']);
    }
}
