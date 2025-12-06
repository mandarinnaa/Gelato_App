<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_payment_cards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('payment_method_id')->constrained('payment_methods')->onDelete('cascade');
            $table->enum('payment_type', ['card', 'paypal'])->default('card');
            
            // Datos de tarjeta (solo si payment_type = 'card')
            $table->string('card_holder_name')->nullable();
            $table->string('card_number_encrypted')->nullable();
            $table->string('card_last_four', 4)->nullable();
            $table->string('card_brand')->nullable(); // visa, mastercard, amex, discover
            $table->string('expiry_month', 2)->nullable();
            $table->string('expiry_year', 4)->nullable();
            
            // Datos de PayPal (solo si payment_type = 'paypal')
            $table->string('paypal_email')->nullable();
            $table->string('paypal_payer_id')->nullable();
            
            $table->boolean('is_default')->default(false);
            $table->timestamps();
            
            $table->index('user_id');
            $table->index(['user_id', 'is_default']);
            $table->index('payment_type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_payment_cards');
    }
};