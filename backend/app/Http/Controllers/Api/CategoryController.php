<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller {
    public function index() {
        return response()->json(Category::where('is_active',true)->orderBy('sort_order')->withCount('products')->get());
    }

    public function store(Request $request) {
        $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'image_url'   => 'nullable|url',
            'sort_order'  => 'nullable|integer|min:0',
            'is_active'   => 'boolean',
        ]);
        $data = $request->only(['name','description','image_url','sort_order','is_active']);
        $data['slug'] = Str::slug($request->name);
        $cat = Category::create($data);
        return response()->json($cat, 201);
    }

    public function update(Request $request, $id) {
        $cat = Category::findOrFail($id);
        $request->validate([
            'name'        => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'image_url'   => 'nullable|url',
            'sort_order'  => 'nullable|integer|min:0',
            'is_active'   => 'boolean',
        ]);
        $data = $request->only(['name','description','image_url','sort_order','is_active']);
        if (isset($data['name'])) $data['slug'] = Str::slug($data['name']);
        $cat->update($data);
        return response()->json($cat);
    }

    public function destroy($id) {
        Category::findOrFail($id)->delete();
        return response()->json(['message'=>'Category deleted']);
    }
}
