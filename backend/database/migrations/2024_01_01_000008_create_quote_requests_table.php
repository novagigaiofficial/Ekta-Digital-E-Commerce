<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('quote_requests', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->nullable()->constrained()->onDelete('set null');
            $table->string('company_name');
            $table->string('contact_name');
            $table->string('phone');
            $table->string('email');
            $table->json('products_requested');
            $table->string('preferred_payment_method')->nullable();
            $table->text('notes')->nullable();
            $table->enum('status', ['new','in_progress','quoted','won','lost'])->default('new');
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('quote_requests'); }
};
