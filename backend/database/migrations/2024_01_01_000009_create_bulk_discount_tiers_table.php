<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('bulk_discount_tiers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('product_id')->nullable()->constrained()->onDelete('cascade');
            $table->integer('min_quantity');
            $table->decimal('discount_pct', 5, 2);
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('bulk_discount_tiers'); }
};
