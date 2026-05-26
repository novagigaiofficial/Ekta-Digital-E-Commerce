<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\OtpVerification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class OtpController extends Controller {
    public function send(Request $request) {
        $request->validate(['phone_or_email'=>'required|string','purpose'=>'required|in:checkout,login']);
        // Clean up expired OTPs to prevent table bloat
        OtpVerification::where('expires_at', '<', now()->subHours(24))->delete();

        $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        OtpVerification::create(['phone_or_email'=>$request->phone_or_email,'otp'=>$otp,'purpose'=>$request->purpose,'expires_at'=>now()->addMinutes(10)]);
        // TODO production: deliver OTP via SMS (Africa's Talking) or email (SMTP)
        // Example: AfricasTalking::sms()->send($otp, [$request->phone_or_email]);
        \Log::info("OTP for {$request->phone_or_email}: {$otp}");
        $response = ['message'=>'OTP sent successfully'];
        // Only expose OTP in local/dev environment
        if (app()->environment('local')) {
            $response['otp_dev'] = $otp;
        }
        return response()->json($response);
    }
    public function verify(Request $request) {
        $request->validate(['phone_or_email'=>'required|string','otp'=>'required|string|size:6','purpose'=>'required|string']);
        $record = OtpVerification::where('phone_or_email',$request->phone_or_email)->where('otp',$request->otp)->where('purpose',$request->purpose)->where('is_used',false)->where('expires_at','>',now())->latest()->first();
        if (!$record) return response()->json(['message'=>'Invalid or expired OTP'], 422);
        $record->update(['is_used'=>true]);
        $isEmail = str_contains($request->phone_or_email, '@');
        $isNew = false;
        if ($isEmail) {
            $user = User::firstOrCreate(
                ['email'=>$request->phone_or_email],
                ['first_name'=>'Customer','last_name'=>'','email'=>$request->phone_or_email,'phone'=>null,'password'=>bcrypt(Str::random(16)),'account_type'=>'b2c']
            );
            $isNew = $user->wasRecentlyCreated;
        } else {
            $phone = $request->phone_or_email;
            $user = User::where('phone', $phone)->first();
            if (!$user) {
                $user = User::create(['first_name'=>'Customer','last_name'=>'','email'=>$phone.'@guest.ektadigital.co.tz','phone'=>$phone,'password'=>bcrypt(Str::random(16)),'account_type'=>'b2c']);
                $isNew = true;
            }
        }
        $token = $user->createToken('otp_auth')->plainTextToken;
        return response()->json(['message'=>'Verified successfully','user'=>$user,'token'=>$token,'is_new_user'=>$isNew]);
    }
}
