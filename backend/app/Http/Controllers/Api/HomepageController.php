<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\HomepageSection;
use Illuminate\Http\Request;

class HomepageController extends Controller {
    public function index(Request $request) { $q = HomepageSection::orderBy("sort_order"); if (!$request->boolean("admin")) $q->where("is_visible",true); return response()->json($q->get()); }
    public function adminIndex() { return response()->json(HomepageSection::orderBy('sort_order')->get()); }
    public function reorder(Request $request) {
        $request->validate(['sections'=>'required|array','sections.*.id'=>'required','sections.*.sort_order'=>'required|integer']);
        foreach($request->sections as $item) HomepageSection::where('id',$item['id'])->update(['sort_order'=>$item['sort_order']]);
        return response()->json(['message'=>'Order updated']);
    }
    public function toggleVisibility($id) { $s=HomepageSection::findOrFail($id); $s->update(['is_visible'=>!$s->is_visible]); return response()->json($s); }
    public function seed() {
        foreach(['hero','categories','featured','new_arrivals','loyalty','b2b','promotions','reviews','newsletter'] as $i=>$type) HomepageSection::firstOrCreate(['type'=>$type],['sort_order'=>$i,'is_visible'=>true]);
        return response()->json(['message'=>'Sections seeded']);
    }
}
