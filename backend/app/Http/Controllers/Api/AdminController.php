<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Models\QuoteRequest;
use Illuminate\Http\Request;

class AdminController extends Controller {
    public function dashboard() {
        $today = now()->toDateString();
        return response()->json([
            'total_revenue_tzs' => Order::where('payment_status','paid')->sum('total_tzs'),
            'orders_today'      => Order::whereDate('created_at',$today)->count(),
            'active_customers'  => User::where('account_type','!=','admin')->count(),
            'pending_quotes'    => QuoteRequest::where('status','new')->count(),
            'low_stock'         => Product::whereHas('variants', fn($q) => $q->where('stock_quantity','<=',5))
                                    ->with(['variants' => fn($q) => $q->orderBy('stock_quantity')])
                                    ->get(),
            'recent_orders'     => Order::with('user')->orderBy('created_at','desc')->take(10)->get(),
            'revenue_7_days'    => Order::where('payment_status','paid')
                                    ->where('created_at','>=',now()->subDays(7))
                                    ->selectRaw('DATE(created_at) as date, SUM(total_tzs) as total')
                                    ->groupBy('date')
                                    ->orderBy('date')
                                    ->get(),
        ]);
    }

    public function customers(Request $request) {
        $query = User::where('account_type','!=','admin')
            ->withCount('orders')  // fix N+1: eager-load order count
            ->orderBy('created_at','desc');

        // Search by name or email
        if ($request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('first_name','ilike',"%{$search}%")
                  ->orWhere('last_name','ilike',"%{$search}%")
                  ->orWhere('email','ilike',"%{$search}%")
                  ->orWhere('phone','ilike',"%{$search}%");
            });
        }

        // Filter by account type
        if ($request->account_type && in_array($request->account_type, ['b2c','b2b'])) {
            $query->where('account_type', $request->account_type);
        }

        return response()->json($query->paginate(25));
    }
}
