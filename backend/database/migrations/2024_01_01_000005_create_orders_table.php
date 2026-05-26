<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('orders', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('order_number')->unique();
            $table->foreignUuid('user_id')->constrained()->onDelete('cascade');
            $table->enum('order_type', ['b2c', 'b2b'])->default('b2c');
            $table->enum('status', ['pending','confirmed','processing','shipped','delivered','cancelled'])->default('pending');
            $table->decimal('subtotal_tzs', 12, 2);
            $table->decimal('vat_amount_tzs', 12, 2);
            $table->decimal('discount_tzs', 12, 2)->default(0);
            $table->integer('loyalty_points_used')->default(0);
            $table->decimal('total_tzs', 12, 2);
            $table->enum('delivery_type', ['delivery', 'click_and_collect']);
            $table->json('delivery_address')->nullable();
            $table->string('payment_method');
            $table->enum('payment_status', ['pending','paid','failed'])->default('pending');
            $table->string('payment_reference')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->string('delivery_confirmed_by')->nullable();
            $table->text('delivery_note')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('orders'); }
};
