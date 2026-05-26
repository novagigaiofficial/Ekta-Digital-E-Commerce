<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\PaymentTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    // ─── Initiate Payment ────────────────────────────────────────────────────
    public function initiate(Request $request, string $orderId)
    {
        $request->validate([
            'gateway' => 'required|in:selcom,paypal,bank_transfer',
            'phone'   => 'nullable|string|max:20', // for mobile money
        ]);

        $order = Order::with('user')
            ->where('user_id', $request->user()->id)
            ->where('payment_status', 'pending')
            ->findOrFail($orderId);

        if ($order->payment_status === 'paid') {
            return response()->json(['message' => 'This order is already paid.'], 422);
        }

        return match ($request->gateway) {
            'selcom'       => $this->initiateSelcom($order, $request->phone ?? $order->user->phone),
            'paypal'       => $this->initiatePayPal($order),
            'bank_transfer'=> $this->initiateBankTransfer($order),
        };
    }

    // ─── Selcom (M-Pesa, Airtel, Visa, CRDB, Selcom Wallet) ─────────────────
    private function initiateSelcom(Order $order, ?string $phone): \Illuminate\Http\JsonResponse
    {
        $apiKey    = config('payment.selcom.api_key');
        $apiSecret = config('payment.selcom.api_secret');
        $vendorId  = config('payment.selcom.vendor_id');
        $baseUrl   = config('payment.selcom.base_url', 'https://apigw.selcommobile.com/v1');

        if (!$apiKey || !$apiSecret || !$vendorId) {
            // Demo mode — return instructions without calling Selcom
            return $this->demoPaymentResponse($order, 'selcom');
        }

        $orderRef  = 'EKT-' . strtoupper(Str::random(12));
        $timestamp = now()->format('Y-m-dTH:i:s');
        $amount    = (int) ceil($order->total_tzs); // Selcom expects integer TZS

        // Build Selcom signature: base64(HMAC-SHA256(apiKey+timestamp, apiSecret))
        $signedFields = $apiKey . $timestamp;
        $signature    = base64_encode(hash_hmac('sha256', $signedFields, $apiSecret, true));

        $payload = [
            'vendor'          => $vendorId,
            'order_id'        => $orderRef,
            'buyer_email'     => $order->user->email,
            'buyer_name'      => trim("{$order->user->first_name} {$order->user->last_name}"),
            'buyer_phone'     => preg_replace('/[^0-9]/', '', $phone ?? ''),
            'gateway'         => 'MASTERPASS', // Selcom checkout page (supports all methods)
            'no_of_items'     => $order->items->count(),
            'currency'        => 'TZS',
            'amount'          => $amount,
            'redirect_url'    => config('payment.selcom.redirect_url') . "?order={$order->id}",
            'cancel_url'      => config('payment.selcom.cancel_url')   . "?order={$order->id}",
            'webhook'         => url('/api/v1/payment/webhook/selcom'),
        ];

        try {
            $response = Http::withHeaders([
                'Content-Type'  => 'application/json;charset=utf-8',
                'Accept'        => 'application/json',
                'Authorization' => 'SELCOM ' . base64_encode($apiKey . ':' . $timestamp . ':' . $signature),
                'Digest-Method' => 'HS256',
                'Timestamp'     => $timestamp,
            ])->post("{$baseUrl}/checkout/create-order", $payload);

            $body = $response->json();

            if (($body['resultcode'] ?? '') !== '000') {
                Log::error('Selcom initiate failed', ['response' => $body, 'order' => $order->id]);
                return response()->json([
                    'message' => 'Payment gateway error: ' . ($body['result'] ?? 'Unknown error'),
                ], 502);
            }

            $txn = PaymentTransaction::create([
                'order_id'          => $order->id,
                'gateway'           => 'selcom',
                'gateway_ref'       => $body['data'][0]['transid'] ?? null,
                'gateway_order_ref' => $orderRef,
                'status'            => 'pending',
                'amount'            => $order->total_tzs,
                'currency'          => 'TZS',
                'gateway_response'  => $body,
                'payment_url'       => $body['data'][0]['payment_gateway_url'] ?? null,
            ]);

            // Update order with gateway reference
            $order->update(['payment_reference' => $orderRef]);

            return response()->json([
                'gateway'     => 'selcom',
                'payment_url' => $txn->payment_url,
                'order_ref'   => $orderRef,
                'txn_id'      => $txn->id,
                'message'     => 'Redirecting to Selcom payment page...',
            ]);
        } catch (\Exception $e) {
            Log::error('Selcom request exception', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Could not reach payment gateway. Please try again.'], 503);
        }
    }

    // ─── PayPal ──────────────────────────────────────────────────────────────
    private function initiatePayPal(Order $order): \Illuminate\Http\JsonResponse
    {
        $clientId     = config('payment.paypal.client_id');
        $clientSecret = config('payment.paypal.client_secret');
        $mode         = config('payment.paypal.mode', 'sandbox'); // sandbox | live
        $baseUrl      = $mode === 'live'
            ? 'https://api-m.paypal.com'
            : 'https://api-m.sandbox.paypal.com';

        if (!$clientId || !$clientSecret) {
            return $this->demoPaymentResponse($order, 'paypal');
        }

        try {
            // Step 1: Get access token
            $tokenRes = Http::withBasicAuth($clientId, $clientSecret)
                ->asForm()
                ->post("{$baseUrl}/v1/oauth2/token", ['grant_type' => 'client_credentials']);
            $accessToken = $tokenRes->json('access_token');
            if (!$accessToken) throw new \Exception('PayPal auth failed');

            // Convert TZS to USD (PayPal requires a supported currency)
            $exchangeRate = config('payment.paypal.tzs_to_usd_rate', 0.00038);
            $amountUsd    = number_format($order->total_tzs * $exchangeRate, 2, '.', '');
            $orderRef     = 'EKT-PP-' . strtoupper(Str::random(10));

            // Step 2: Create PayPal order
            $ppOrderRes = Http::withToken($accessToken)
                ->post("{$baseUrl}/v2/checkout/orders", [
                    'intent'         => 'CAPTURE',
                    'purchase_units' => [[
                        'reference_id' => $orderRef,
                        'description'  => "Ekta Digital Order {$order->order_number}",
                        'amount'       => [
                            'currency_code' => 'USD',
                            'value'         => $amountUsd,
                        ],
                    ]],
                    'application_context' => [
                        'return_url' => config('payment.paypal.return_url') . "?order={$order->id}",
                        'cancel_url' => config('payment.paypal.cancel_url') . "?order={$order->id}",
                        'brand_name' => 'Ekta Digital',
                    ],
                ]);

            $ppOrder = $ppOrderRes->json();
            if (!isset($ppOrder['id'])) throw new \Exception('PayPal order creation failed');

            $approvalUrl = collect($ppOrder['links'])->firstWhere('rel', 'approve')['href'] ?? null;

            $txn = PaymentTransaction::create([
                'order_id'          => $order->id,
                'gateway'           => 'paypal',
                'gateway_ref'       => $ppOrder['id'],
                'gateway_order_ref' => $orderRef,
                'status'            => 'pending',
                'amount'            => $order->total_tzs,
                'currency'          => 'TZS',
                'gateway_response'  => $ppOrder,
                'payment_url'       => $approvalUrl,
            ]);

            $order->update(['payment_reference' => $ppOrder['id']]);

            return response()->json([
                'gateway'     => 'paypal',
                'payment_url' => $approvalUrl,
                'pp_order_id' => $ppOrder['id'],
                'amount_usd'  => $amountUsd,
                'txn_id'      => $txn->id,
                'message'     => 'Redirecting to PayPal...',
            ]);
        } catch (\Exception $e) {
            Log::error('PayPal initiate error', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'PayPal is temporarily unavailable. Please try another method.'], 503);
        }
    }

    // ─── Bank Transfer (B2B Invoice) ─────────────────────────────────────────
    private function initiateBankTransfer(Order $order): \Illuminate\Http\JsonResponse
    {
        $txn = PaymentTransaction::create([
            'order_id'  => $order->id,
            'gateway'   => 'bank_transfer',
            'status'    => 'pending',
            'amount'    => $order->total_tzs,
            'currency'  => 'TZS',
            'gateway_response' => ['instructions' => 'Awaiting manual bank transfer confirmation by admin'],
        ]);

        return response()->json([
            'gateway'      => 'bank_transfer',
            'order_number' => $order->order_number,
            'amount'       => $order->total_tzs,
            'bank_details' => [
                'bank'         => 'CRDB Bank',
                'account_name' => 'Ekta Digital Ltd',
                'account_no'   => config('payment.bank.account_number', 'Contact us for account details'),
                'branch'       => 'India Street, Dar-es-Salaam',
                'swift'        => 'CORUTZTZ',
            ],
            'instructions' => 'Transfer the exact amount and use your order number as the payment reference. We will confirm receipt and process your order within 1 business day.',
            'txn_id'       => $txn->id,
        ]);
    }

    // ─── Demo mode (no credentials configured) ───────────────────────────────
    private function demoPaymentResponse(Order $order, string $gateway): \Illuminate\Http\JsonResponse
    {
        $txn = PaymentTransaction::create([
            'order_id'  => $order->id,
            'gateway'   => $gateway,
            'status'    => 'pending',
            'amount'    => $order->total_tzs,
            'currency'  => 'TZS',
            'gateway_response' => ['mode' => 'demo', 'note' => 'No credentials configured'],
            'payment_url'      => null,
        ]);

        return response()->json([
            'gateway'    => $gateway,
            'demo_mode'  => true,
            'message'    => "Payment gateway not yet configured. Order {$order->order_number} recorded as pending. Admin can manually mark as paid.",
            'txn_id'     => $txn->id,
            'order_id'   => $order->id,
        ], 202);
    }

    // ─── PayPal Capture (called after customer approves on PayPal) ───────────
    public function capturePayPal(Request $request)
    {
        $request->validate([
            'pp_order_id' => 'required|string',
            'order_id'    => 'required|uuid|exists:orders,id',
        ]);

        $clientId     = config('payment.paypal.client_id');
        $clientSecret = config('payment.paypal.client_secret');
        $mode         = config('payment.paypal.mode', 'sandbox');
        $baseUrl      = $mode === 'live'
            ? 'https://api-m.paypal.com'
            : 'https://api-m.sandbox.paypal.com';

        DB::beginTransaction();
        try {
            $tokenRes    = Http::withBasicAuth($clientId, $clientSecret)->asForm()
                ->post("{$baseUrl}/v1/oauth2/token", ['grant_type' => 'client_credentials']);
            $accessToken = $tokenRes->json('access_token');

            $captureRes = Http::withToken($accessToken)
                ->post("{$baseUrl}/v2/checkout/orders/{$request->pp_order_id}/capture");
            $capture    = $captureRes->json();

            $status = $capture['status'] ?? '';
            $txn    = PaymentTransaction::where('gateway_ref', $request->pp_order_id)->first();

            if ($status === 'COMPLETED') {
                $txn?->update(['status' => 'success', 'paid_at' => now(), 'gateway_response' => $capture]);
                $order = Order::findOrFail($request->order_id);
                $order->update(['payment_status' => 'paid', 'payment_reference' => $request->pp_order_id]);
                DB::commit();
                return response()->json(['message' => 'Payment captured successfully!', 'status' => 'paid']);
            }

            $txn?->update(['status' => 'failed', 'gateway_response' => $capture]);
            DB::rollBack();
            return response()->json(['message' => 'PayPal capture failed. Status: ' . $status], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('PayPal capture error', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'PayPal capture error. Please contact support.'], 500);
        }
    }

    // ─── Selcom Webhook ───────────────────────────────────────────────────────
    public function webhookSelcom(Request $request)
    {
        $payload = $request->all();
        Log::info('Selcom webhook received', $payload);

        // Validate webhook signature
        $apiKey    = config('payment.selcom.api_key');
        $apiSecret = config('payment.selcom.api_secret');
        $timestamp = $request->header('Timestamp');
        $received  = $request->header('Authorization', '');

        // Find the transaction by gateway order ref
        $orderRef = $payload['order_id'] ?? $payload['reference'] ?? null;
        if (!$orderRef) return response()->json(['status' => 'ignored']);

        $txn = PaymentTransaction::where('gateway_order_ref', $orderRef)
            ->orWhere('gateway_ref', $payload['transid'] ?? '')
            ->first();

        if (!$txn) {
            Log::warning('Selcom webhook: transaction not found', ['order_ref' => $orderRef]);
            return response()->json(['status' => 'not_found'], 404);
        }

        DB::beginTransaction();
        try {
            $selcomStatus = strtolower($payload['payment_status'] ?? $payload['resultcode'] ?? '');
            $isSuccess    = in_array($selcomStatus, ['success', 'completed', '000']);

            $txnStatus = $isSuccess ? 'success' : 'failed';
            $txn->update([
                'status'           => $txnStatus,
                'gateway_ref'      => $payload['transid']   ?? $txn->gateway_ref,
                'paid_at'          => $isSuccess ? now()    : null,
                'gateway_response' => array_merge($txn->gateway_response ?? [], $payload),
            ]);

            if ($isSuccess) {
                $txn->order->update([
                    'payment_status'   => 'paid',
                    'payment_reference'=> $payload['transid'] ?? $orderRef,
                    'status'           => 'confirmed',
                ]);
            }

            DB::commit();
            return response()->json(['status' => 'received']);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Selcom webhook processing error', ['error' => $e->getMessage()]);
            return response()->json(['status' => 'error'], 500);
        }
    }

    // ─── PayPal Webhook ──────────────────────────────────────────────────────
    public function webhookPayPal(Request $request)
    {
        $event   = $request->json('event_type');
        $payload = $request->all();
        Log::info('PayPal webhook', ['event' => $event]);

        if ($event === 'PAYMENT.CAPTURE.COMPLETED') {
            $ppOrderId = $payload['resource']['supplementary_data']['related_ids']['order_id']
                ?? $payload['resource']['id']
                ?? null;

            if ($ppOrderId) {
                $txn = PaymentTransaction::where('gateway_ref', $ppOrderId)->first();
                if ($txn && $txn->status !== 'success') {
                    $txn->update(['status' => 'success', 'paid_at' => now(), 'gateway_response' => $payload]);
                    $txn->order->update(['payment_status' => 'paid', 'status' => 'confirmed']);
                }
            }
        }
        return response()->json(['status' => 'received']);
    }

    // ─── Payment Status (poll from frontend) ─────────────────────────────────
    public function status(Request $request, string $orderId)
    {
        $order = Order::where('user_id', $request->user()->id)->findOrFail($orderId);
        $txn   = PaymentTransaction::where('order_id', $orderId)->latest()->first();

        return response()->json([
            'order_id'       => $order->id,
            'order_number'   => $order->order_number,
            'payment_status' => $order->payment_status,
            'order_status'   => $order->status,
            'txn_status'     => $txn?->status,
            'gateway'        => $txn?->gateway,
        ]);
    }

    // ─── Admin: manually mark an order as paid ────────────────────────────────
    public function adminMarkPaid(Request $request, string $orderId)
    {
        $request->validate([
            'payment_reference' => 'nullable|string|max:255',
            'note'              => 'nullable|string|max:500',
        ]);
        $order = Order::findOrFail($orderId);
        $order->update([
            'payment_status'   => 'paid',
            'payment_reference'=> $request->payment_reference,
        ]);
        PaymentTransaction::create([
            'order_id'  => $order->id,
            'gateway'   => 'manual',
            'status'    => 'success',
            'amount'    => $order->total_tzs,
            'currency'  => 'TZS',
            'paid_at'   => now(),
            'gateway_response' => ['note' => $request->note, 'marked_by' => $request->user()->email],
        ]);
        return response()->json(['message' => 'Order marked as paid.', 'order' => $order]);
    }
}
