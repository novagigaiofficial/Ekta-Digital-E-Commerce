<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('payment_transactions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('order_id')->constrained()->onDelete('cascade');
            $table->string('gateway');                     // selcom, paypal, bank_transfer
            $table->string('gateway_ref')->nullable();     // gateway's transaction/checkout ID
            $table->string('gateway_order_ref')->nullable(); // our reference sent to gateway
            $table->enum('status', ['initiated','pending','success','failed','cancelled'])->default('initiated');
            $table->decimal('amount', 12, 2);
            $table->string('currency', 10)->default('TZS');
            $table->json('gateway_response')->nullable();  // raw gateway response for audit
            $table->string('payment_url')->nullable();     // redirect URL for hosted pages
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('payment_transactions'); }
};
