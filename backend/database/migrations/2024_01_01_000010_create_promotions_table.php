<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('promotions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->enum('type', ['percentage', 'fixed', 'code'])->default('percentage');
            $table->string('discount_code')->nullable()->unique();
            $table->decimal('discount_value', 10, 2);
            $table->enum('applies_to', ['all', 'category', 'product'])->default('all');
            $table->uuid('applies_to_id')->nullable();
            $table->timestamp('start_date')->nullable();
            $table->timestamp('end_date')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('promotions'); }
};
