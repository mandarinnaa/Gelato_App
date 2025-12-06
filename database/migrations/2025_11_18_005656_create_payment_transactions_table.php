<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('order_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('user_payment_card_id')->nullable()->constrained()->onDelete('set null');
            
            $table->enum('payment_type', ['card', 'paypal']);
            $table->enum('status', ['pending', 'completed', 'failed', 'refunded'])->default('pending');
            
            $table->string('transaction_id')->nullable()->unique(); // ID de PayPal o procesador
            $table->string('payment_id')->nullable(); // Payment ID de PayPal
            $table->string('payer_id')->nullable(); // Payer ID de PayPal
            
            $table->decimal('amount', 10, 2);
            $table->string('currency', 3)->default('MXN');
            
            $table->text('description')->nullable();
            $table->json('metadata')->nullable(); // Info adicional
            
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            
            $table->index('user_id');
            $table->index('order_id');
            $table->index('transaction_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_transactions');
    }
};