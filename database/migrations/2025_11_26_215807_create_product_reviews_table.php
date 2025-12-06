<?php
// database/migrations/2025_11_27_000001_create_product_reviews_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('base_product_id')->constrained('base_products')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('order_id')->nullable()->constrained('orders')->onDelete('set null');
            $table->decimal('rating', 2, 1)->comment('Rating de 0.5 a 5.0');
            $table->text('comment')->nullable();
            $table->boolean('verified_purchase')->default(false);
            $table->timestamps();
            
            // Índices para mejorar rendimiento
            $table->index('base_product_id');
            $table->index('user_id');
            $table->index('rating');
            $table->index('verified_purchase');
            
            // Un usuario solo puede hacer una reseña por producto
            $table->unique(['base_product_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_reviews');
    }
};