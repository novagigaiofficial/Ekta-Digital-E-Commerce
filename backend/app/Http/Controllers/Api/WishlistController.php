<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Wishlist;
use Illuminate\Http\Request;

class WishlistController extends Controller {
    public function index(Request $request) { return response()->json(Wishlist::with('product')->where('user_id',$request->user()->id)->get()); }
    public function toggle(Request $request) {
        $request->validate(['product_id'=>'required|uuid|exists:products,id']);
        $exists=Wishlist::where('user_id',$request->user()->id)->where('product_id',$request->product_id)->first();
        if($exists){$exists->delete();return response()->json(['message'=>'Removed from wishlist','in_wishlist'=>false]);}
        Wishlist::create(['user_id'=>$request->user()->id,'product_id'=>$request->product_id]);
        return response()->json(['message'=>'Added to wishlist','in_wishlist'=>true]);
    }
}
