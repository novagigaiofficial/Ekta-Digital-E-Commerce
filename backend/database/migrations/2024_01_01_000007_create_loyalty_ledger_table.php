<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('loyalty_ledger', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained()->onDelete('cascade');
            $table->foreignUuid('order_id')->nullable()->constrained()->onDelete('set null');
            $table->integer('points_delta');
            $table->integer('balance_after');
            $table->enum('type', ['earn','redeem','admin_adjust','refund']);
            $table->string('note')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('loyalty_ledger'); }
};
