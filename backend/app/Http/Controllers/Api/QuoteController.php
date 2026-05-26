<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\QuoteRequest as Quote;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class QuoteController extends Controller {
    public function store(Request $request) {
        $request->validate([
            'company_name'              => 'required|string|max:255',
            'contact_name'              => 'required|string|max:255',
            'phone'                     => 'required|string|max:20',
            'email'                     => 'nullable|email|max:255',
            'products_requested'        => 'required|array|min:1',
            'products_requested.*.name' => 'required|string',
            'products_requested.*.qty'  => 'required|integer|min:1',
            'preferred_payment_method'  => 'nullable|string',
            'notes'                     => 'nullable|string|max:1000',
        ]);
        $quote = Quote::create($request->only([
            'company_name','contact_name','phone','email',
            'products_requested','preferred_payment_method','notes',
        ]));
        $this->sendWhatsAppNotification($quote);
        return response()->json(['message'=>'Quote request received. We will contact you shortly.','quote'=>$quote], 201);
    }

    public function index() {
        return response()->json(Quote::orderBy('created_at','desc')->paginate(20));
    }

    public function update(Request $request, $id) {
        $request->validate(['status'=>'required|in:new,in_progress,quoted,won,lost']);
        $quote = Quote::findOrFail($id);
        $quote->update(['status'=>$request->status]);
        return response()->json($quote);
    }

    private function sendWhatsAppNotification(Quote $quote): void {
        $apiKey = config('app.whatsapp_api_key');
        $number = config('app.whatsapp_number');

        if (!$apiKey || !$number) {
            Log::warning('WhatsApp notification skipped — WHATSAPP_API_KEY or WHATSAPP_NUMBER not configured.');
            return;
        }

        $products = collect($quote->products_requested)
            ->map(fn($p) => "• {$p['name']} x{$p['qty']}")
            ->implode("\n");

        $message = "🔔 *New Quote Request — Ekta Digital*\n\n"
            . "*Company:* {$quote->company_name}\n"
            . "*Contact:* {$quote->contact_name}\n"
            . "*Phone:* {$quote->phone}\n"
            . "*Email:* ".($quote->email ?? '—')."\n\n"
            . "*Products Requested:*\n{$products}\n\n"
            . "*Payment:* ".($quote->preferred_payment_method ?? '—')."\n"
            . "*Notes:* ".($quote->notes ?? '—');

        try {
            Http::get("https://api.callmebot.com/whatsapp.php", [
                'phone'  => $number,
                'text'   => $message,
                'apikey' => $apiKey,
            ]);
        } catch (\Exception $e) {
            Log::error('WhatsApp notification failed: '.$e->getMessage());
        }
    }
}
