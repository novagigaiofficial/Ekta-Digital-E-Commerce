<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class ContactController extends Controller {
    public function store(Request $request) {
        $request->validate([
            'name'    => 'required|string|max:255',
            'email'   => 'required|email',
            'phone'   => 'nullable|string|max:30',
            'subject' => 'nullable|string|max:255',
            'message' => 'required|string|min:10|max:2000',
        ]);
        $msg = ContactMessage::create($request->only(['name','email','phone','subject','message']));
        // Notify admin by email
        try {
            Mail::raw(
                "New contact message from {$msg->name} ({$msg->email})\n\nSubject: {$msg->subject}\nPhone: {$msg->phone}\n\nMessage:\n{$msg->message}",
                fn($m) => $m->to(config('mail.from.address'))->subject("New Contact Message: {$msg->subject}")
            );
        } catch (\Exception $e) {
            Log::error('Contact notification email failed: '.$e->getMessage());
        }
        return response()->json(['message' => 'Message received. We will get back to you within 24 hours.'], 201);
    }

    public function index() {
        return response()->json(ContactMessage::orderBy('created_at','desc')->paginate(20));
    }
}
