<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\HeroSlide;
use Illuminate\Http\Request;

class HeroSlideController extends Controller {
    public function index() {
        return response()->json(HeroSlide::where('is_active',true)->orderBy('sort_order')->get());
    }

    public function adminIndex() {
        return response()->json(HeroSlide::orderBy('sort_order')->get());
    }

    public function store(Request $request) {
        $request->validate([
            'tag'       => 'required|string|max:100',
            'headline'  => 'required|string|max:255',
            'sub'       => 'nullable|string|max:400',
            'cta_text'  => 'nullable|string|max:60',
            'cta_href'  => 'nullable|string|max:255',
            'image_url' => 'nullable|url',
            'is_active' => 'boolean',
        ]);
        $slide = HeroSlide::create($request->only([
            'tag','headline','sub','cta_text','cta_href','image_url','is_active','sort_order',
        ]));
        return response()->json($slide, 201);
    }

    public function update(Request $request, $id) {
        $slide = HeroSlide::findOrFail($id);
        $slide->update($request->only([
            'tag','headline','sub','cta_text','cta_href','image_url','is_active','sort_order',
        ]));
        return response()->json($slide);
    }

    public function destroy($id) {
        HeroSlide::findOrFail($id)->delete();
        return response()->json(['message'=>'Slide deleted']);
    }

    public function reorder(Request $request) {
        $request->validate(['slides'=>'required|array','slides.*.id'=>'required','slides.*.sort_order'=>'required|integer']);
        foreach ($request->slides as $item) {
            HeroSlide::where('id',$item['id'])->update(['sort_order'=>$item['sort_order']]);
        }
        return response()->json(['message'=>'Reordered']);
    }
}
