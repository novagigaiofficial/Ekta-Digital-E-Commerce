<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductController extends Controller {
    public function index(Request $request) {
        // Admin can see all statuses via ?admin=1 (already protected by middleware at route level for admin calls)
        $query = Product::with(['category','variants','bulkDiscountTiers']);

        if (!$request->boolean('admin')) {
            $query->where('status','active');
        }

        if ($request->category)    $query->whereHas('category', fn($q) => $q->where('slug',$request->category));
        if ($request->brand) $query->where('brand','ilike',"%{$request->brand}%");
        if ($request->min_price)   $query->where('base_price_tzs','>=',$request->min_price);
        if ($request->max_price)   $query->where('base_price_tzs','<=',$request->max_price);
        if ($request->featured)    $query->where('is_featured',true);
        if ($request->new_arrivals)$query->where('is_new_arrival',true);
        if ($request->search)      $query->where(fn($q)=>$q->where('name','ilike',"%{$request->search}%")->orWhere('brand','ilike',"%{$request->search}%")->orWhere('description','ilike',"%{$request->search}%"));

        match($request->sort) {
            'price_asc'  => $query->orderBy('base_price_tzs','asc'),
            'price_desc' => $query->orderBy('base_price_tzs','desc'),
            'newest'     => $query->orderBy('created_at','desc'),
            default      => $query->orderBy('created_at','desc'),
        };

        return response()->json($query->paginate($request->per_page ?? 12));
    }

    public function show($slug) {
        $product = Product::with(['category','variants','bulkDiscountTiers'=>fn($q)=>$q->orderBy('min_quantity')])->where('slug',$slug)->where('status','active')->firstOrFail();
        return response()->json($product);
    }

    public function store(Request $request) {
        $request->validate([
            'name'          => 'required|string|max:255',
            'category_id'   => 'required|uuid|exists:categories,id',
            'base_price_tzs'=> 'required|numeric|min:0',
            'status'        => 'in:draft,active,archived',
        ]);
        $data = $request->only(['name','category_id','brand','base_price_tzs','offer_price_tzs','vat_rate','video_url','images','tags','is_featured','is_new_arrival','is_top_seller','status','description','short_description']);
        $data['slug'] = Str::slug($request->name).'-'.Str::random(6);
        $product = Product::create($data);
        return response()->json($product, 201);
    }

    public function update(Request $request, $id) {
        $product = Product::findOrFail($id);
        $data = $request->only(['name','category_id','brand','base_price_tzs','offer_price_tzs','vat_rate','video_url','images','tags','is_featured','is_new_arrival','is_top_seller','status','description','short_description']);
        $product->update($data);
        return response()->json($product);
    }

    public function destroy($id) {
        Product::findOrFail($id)->delete();
        return response()->json(['message'=>'Product deleted']);
    }
}
