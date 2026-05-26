<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email')->unique();
            $table->string('password');
            $table->enum('account_type', ['b2c', 'b2b', 'admin'])->default('b2c');
            $table->enum('b2b_status', ['pending', 'verified', 'rejected'])->nullable();
            $table->string('company_name')->nullable();
            $table->string('business_reg_number')->nullable();
            $table->string('phone')->nullable();
            $table->integer('loyalty_points_balance')->default(0);
            $table->timestamp('email_verified_at')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('users'); }
};
