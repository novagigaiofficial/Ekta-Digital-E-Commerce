<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('hero_slides', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('tag');
            $table->string('headline');
            $table->string('sub')->nullable();
            $table->string('cta_text')->default('Shop Now');
            $table->string('cta_href')->default('/shop');
            $table->string('image_url')->nullable();
            $table->string('bg_color')->default('from-teal-light to-white');
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('hero_slides'); }
};
