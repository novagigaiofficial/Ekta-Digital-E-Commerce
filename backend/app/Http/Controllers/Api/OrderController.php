<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ProductVariant;
use App\Models\LoyaltyLedger;
use App\Models\Promotion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class OrderController extends Controller {
    public function index(Request $request) {
        return response()->json(Order::with('items.variant.product')->where('user_id',$request->user()->id)->orderBy('created_at','desc')->paginate(10));
    }
    public function show(Request $request,$id) {
        return response()->json(Order::with('items.variant.product')->where('user_id',$request->user()->id)->findOrFail($id));
    }
    public function store(Request $request) {
        $request->validate([
            'items'                   => 'required|array|min:1',
            'items.*.variant_id'      => 'required|uuid|exists:product_variants,id',
            'items.*.quantity'        => 'required|integer|min:1',
            'delivery_type'           => 'required|in:delivery,click_and_collect',
            'delivery_address'        => 'required_if:delivery_type,delivery|array',
            'payment_method'          => 'required|string',
            'loyalty_points_to_redeem'=> 'nullable|integer|min:0',
            'discount_code'           => 'nullable|string',
        ]);
        DB::beginTransaction();
        try {
            $user = $request->user();
            $subtotal = 0;
            $orderItems = [];

            foreach ($request->items as $item) {
                $variant = ProductVariant::with('product')->lockForUpdate()->findOrFail($item['variant_id']);
                if ($variant->stock_quantity < $item['quantity']) {
                    DB::rollBack();
                    return response()->json(['message'=>"Insufficient stock for {$variant->product->name}"], 422);
                }
                $discount = $variant->product->bulkDiscountTiers()->where('min_quantity','<=',$item['quantity'])->orderBy('min_quantity','desc')->first();
                $discountPct = $discount ? $discount->discount_pct : 0;
                // Use offer price if set, otherwise base price
                $effectivePrice = floatval($variant->product->offer_price_tzs ?? $variant->product->base_price_tzs) + floatval($variant->price_adjustment_tzs);
                $lineTotal = $effectivePrice * $item['quantity'] * (1 - $discountPct / 100);
                $subtotal += $lineTotal;
                $orderItems[] = [
                    'variant_id'       => $variant->id,
                    'quantity'         => $item['quantity'],
                    'unit_price_tzs'   => $effectivePrice,
                    'bulk_discount_pct'=> $discountPct,
                    'line_total_tzs'   => $lineTotal,
                ];
                $variant->decrement('stock_quantity', $item['quantity']);
                $variant->product->increment('total_sold', $item['quantity']);
            }

            // --- Promotion / discount code ---
            $promoDiscount = 0;
            $promoUsed = null;
            if ($request->filled('discount_code')) {
                $promo = Promotion::where('discount_code', strtoupper($request->discount_code))
                    ->where('is_active', true)
                    ->where(fn($q) => $q->whereNull('start_date')->orWhere('start_date','<=',now()))
                    ->where(fn($q) => $q->whereNull('end_date')->orWhere('end_date','>=',now()))
                    ->first();
                if (!$promo) {
                    DB::rollBack();
                    return response()->json(['message'=>'Invalid or expired discount code'], 422);
                }
                $promoDiscount = $promo->type === 'percentage'
                    ? $subtotal * ($promo->discount_value / 100)
                    : floatval($promo->discount_value);
                $promoDiscount = min($promoDiscount, $subtotal);
                $promoUsed = $promo;
            }

            // --- Loyalty points redemption (atomic) ---
            $loyaltyDiscount = 0;
            $pointsToRedeem = intval($request->loyalty_points_to_redeem ?? 0);
            if ($pointsToRedeem > 0) {
                // Re-fetch balance inside transaction with lock
                $freshUser = \App\Models\User::lockForUpdate()->find($user->id);
                $pointsToRedeem = min($pointsToRedeem, $freshUser->loyalty_points_balance);
                $loyaltyDiscount = $pointsToRedeem * 5;
            }

            // --- VAT & total ---
            // base_price_tzs is VAT-inclusive (18%). Extract VAT component.
            $totalDiscount = $promoDiscount + $loyaltyDiscount;
            $vatAmount = $subtotal * 0.18 / 1.18;   // extract embedded VAT (prices are VAT-inclusive)
            $total = max(0, $subtotal - $totalDiscount);

            $order = Order::create([
                'user_id'              => $user->id,
                'order_type'           => $user->account_type === 'b2b' ? 'b2b' : 'b2c',
                'subtotal_tzs'         => $subtotal,
                'vat_amount_tzs'       => $vatAmount,
                'discount_tzs'         => $totalDiscount,
                'loyalty_points_used'  => $pointsToRedeem,
                'total_tzs'            => $total,
                'delivery_type'        => $request->delivery_type,
                'delivery_address'     => $request->delivery_address,
                'payment_method'       => $request->payment_method,
                'payment_status'       => 'pending',
                'status'               => 'pending',
            ]);

            foreach ($orderItems as $item) {
                $order->items()->create($item);
            }

            // Deduct loyalty points atomically
            if ($pointsToRedeem > 0) {
                \App\Models\User::where('id', $user->id)->decrement('loyalty_points_balance', $pointsToRedeem);
                $user->refresh();
                LoyaltyLedger::create(['user_id'=>$user->id,'order_id'=>$order->id,'points_delta'=>-$pointsToRedeem,'balance_after'=>$user->loyalty_points_balance,'type'=>'redeem','note'=>"Redeemed for order {$order->order_number}"]);
            }

            // Earn loyalty points
            $pointsEarned = (int)($total / 1000);
            if ($pointsEarned > 0) {
                \App\Models\User::where('id', $user->id)->increment('loyalty_points_balance', $pointsEarned);
                $user->refresh();
                LoyaltyLedger::create(['user_id'=>$user->id,'order_id'=>$order->id,'points_delta'=>$pointsEarned,'balance_after'=>$user->loyalty_points_balance,'type'=>'earn','note'=>"Earned from order {$order->order_number}"]);
            }

            DB::commit();
            $this->sendOrderConfirmationEmail($order->load('items.variant.product'));
            return response()->json([
                'message'       => 'Order placed successfully',
                'order'         => $order->load('items.variant.product'),
                'points_earned' => $pointsEarned,
                'promo_applied' => $promoUsed ? $promoUsed->name : null,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message'=>'Order failed: '.$e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id) {
        $request->validate(['status'=>'sometimes|in:pending,confirmed,processing,shipped,delivered,cancelled','payment_status'=>'sometimes|in:pending,paid,failed']);
        $order = Order::with(['user','items.variant.product'])->findOrFail($id);
        $oldStatus = $order->status;
        $order->update($request->only(['status','payment_status']));
        if ($request->has('status') && $request->status === 'delivered' && $oldStatus !== 'delivered') {
            $this->sendDeliveredEmail($order);
        }
        if ($request->has('status') && $request->status === 'cancelled' && $oldStatus !== 'cancelled') {
            $this->restoreStock($order);
        }
        return response()->json(['message'=>'Order updated','order'=>$order]);
    }

    public function adminIndex(Request $request) {
        $query = Order::with('user')->orderBy('created_at','desc');
        if ($request->status && $request->status !== 'all') $query->where('status',$request->status);
        if ($request->search) $query->where('order_number','ilike',"%{$request->search}%");
        return response()->json($query->paginate(20));
    }

    public function adminShow($id) {
        return response()->json(Order::with(['user','items.variant.product'])->findOrFail($id));
    }

    public function confirmDelivery(Request $request, $id) {
        $order = Order::with(['user','items.variant.product'])->where('user_id',$request->user()->id)->whereIn('status',['shipped','confirmed','processing'])->findOrFail($id);
        DB::beginTransaction();
        try {
            $order->update(['status'=>'delivered','delivered_at'=>now(),'delivery_confirmed_by'=>'customer']);
            $this->sendDeliveredEmail($order);
            DB::commit();
            return response()->json(['message'=>'Delivery confirmed. Your invoice is now ready.','order'=>$order]);
        } catch (\Exception $e) { DB::rollBack(); return response()->json(['message'=>'Failed: '.$e->getMessage()], 500); }
    }

    public function adminConfirmDelivery(Request $request, $id) {
        $request->validate(['delivery_note'=>'nullable|string|max:500','confirmed_by'=>'nullable|string']);
        $order = Order::with(['user','items.variant.product'])->findOrFail($id);
        if ($order->status === 'delivered') return response()->json(['message'=>'Order already delivered.'], 422);
        DB::beginTransaction();
        try {
            $order->update(['status'=>'delivered','delivered_at'=>now(),'delivery_confirmed_by'=>$request->confirmed_by ?? 'admin','delivery_note'=>$request->delivery_note]);
            $this->sendDeliveredEmail($order);
            DB::commit();
            return response()->json(['message'=>'Order confirmed as delivered. Customer notified.','order'=>$order]);
        } catch (\Exception $e) { DB::rollBack(); return response()->json(['message'=>'Failed: '.$e->getMessage()], 500); }
    }

    private function restoreStock(Order $order): void {
        foreach ($order->items as $item) {
            ProductVariant::where('id',$item->variant_id)->increment('stock_quantity',$item->quantity);
            $item->variant->product->decrement('total_sold',$item->quantity);
        }
    }

    private function sendOrderConfirmationEmail(Order $order): void {
        try {
            $user = $order->user;
            if (!$user || !filter_var($user->email, FILTER_VALIDATE_EMAIL)) return;
            if (str_ends_with($user->email, '@guest.ektadigital.co.tz')) return; // skip placeholder emails
            Mail::send('emails.order_confirmation', ['order'=>$order], function($m) use($order,$user) {
                $m->to($user->email, "{$user->first_name} {$user->last_name}")->subject("Order Confirmed — {$order->order_number} | Ekta Digital");
            });
        } catch (\Exception $e) { Log::error('Order confirmation email failed: '.$e->getMessage()); }
    }

    private function sendDeliveredEmail(Order $order): void {
        try {
            $user = $order->user;
            if (!$user || !filter_var($user->email, FILTER_VALIDATE_EMAIL)) return;
            if (str_ends_with($user->email, '@guest.ektadigital.co.tz')) return;
            Mail::send('emails.order_delivered', ['order'=>$order], function($m) use($order,$user) {
                $m->to($user->email, "{$user->first_name} {$user->last_name}")->subject("Your Order Has Been Delivered — {$order->order_number} | Ekta Digital");
            });
        } catch (\Exception $e) { Log::error('Delivered email failed: '.$e->getMessage()); }
    }
}
