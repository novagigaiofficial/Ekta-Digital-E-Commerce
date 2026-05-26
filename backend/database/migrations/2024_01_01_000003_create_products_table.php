<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('products', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('category_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->text('short_description')->nullable();
            $table->string('brand')->nullable();
            $table->decimal('base_price_tzs', 12, 2);
            $table->decimal('offer_price_tzs', 12, 2)->nullable();
            $table->decimal('vat_rate', 4, 2)->default(0.18);
            $table->string('video_url')->nullable();
            $table->json('images')->nullable();
            $table->json('tags')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_new_arrival')->default(false);
            $table->boolean('is_top_seller')->default(false);
            $table->integer('total_sold')->default(0);
            $table->enum('status', ['draft', 'active', 'archived'])->default('active');
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('products'); }
};
