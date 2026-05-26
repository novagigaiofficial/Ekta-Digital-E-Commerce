<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('invoice_templates', function (Blueprint $table) {
            $table->id();
            $table->string('business_name');
            $table->text('business_address');
            $table->string('business_phone');
            $table->string('business_email');
            $table->string('business_website')->nullable();
            $table->string('business_logo')->nullable();
            $table->text('footer_note')->nullable();
            $table->text('bank_details')->nullable();
            $table->string('primary_color')->default('#008080');
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('invoice_templates'); }
};
