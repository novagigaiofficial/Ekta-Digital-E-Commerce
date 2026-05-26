<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\LoyaltyLedger;
use App\Models\User;
use Illuminate\Http\Request;

class LoyaltyController extends Controller {
    public function index(Request $request) {
        $user = $request->user();
        $history = LoyaltyLedger::where('user_id',$user->id)->orderBy('created_at','desc')->paginate(20);
        return response()->json([
            'balance' => $user->loyalty_points_balance,
            'history' => $history,
            'value'   => 'TZS '.number_format($user->loyalty_points_balance * 5, 0, '.', ','),
        ]);
    }

    public function redeem(Request $request) {
        // Redemption is handled at checkout via OrderController.
        // This endpoint exists for API completeness.
        return response()->json(['message' => 'Use loyalty_points_to_redeem in the /orders POST to redeem points at checkout.']);
    }

    public function adminAdjust(Request $request) {
        $request->validate([
            'user_id' => 'required|uuid|exists:users,id',
            'points'  => 'required|integer|not_in:0',
            'note'    => 'required|string|max:255',
        ]);

        $user = User::findOrFail($request->user_id);
        $delta = intval($request->points);

        // Prevent balance going negative
        if ($delta < 0 && abs($delta) > $user->loyalty_points_balance) {
            return response()->json(['message'=>'Cannot deduct more points than the user has.'], 422);
        }

        if ($delta > 0) {
            User::where('id',$user->id)->increment('loyalty_points_balance', $delta);
        } else {
            User::where('id',$user->id)->decrement('loyalty_points_balance', abs($delta));
        }
        $user->refresh();

        LoyaltyLedger::create([
            'user_id'      => $user->id,
            'order_id'     => null,
            'points_delta' => $delta,
            'balance_after'=> $user->loyalty_points_balance,
            'type'         => 'admin_adjust',
            'note'         => $request->note,
        ]);

        return response()->json([
            'message'         => 'Points adjusted successfully.',
            'new_balance'     => $user->loyalty_points_balance,
            'adjustment'      => $delta,
        ]);
    }
}
