<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('custom_products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('order_id')->nullable()->constrained('orders')->onDelete('cascade');
            $table->foreignId('size_id')->constrained('sizes');
            $table->foreignId('flavor_id')->constrained('flavors');
            $table->foreignId('filling_id')->nullable()->constrained('fillings');
            $table->json('toppings')->nullable(); // Array de topping_ids
            $table->decimal('final_price', 10, 2);
            $table->string('status')->default('in_cart'); // in_cart, ordered
            $table->timestamps();
            
            $table->index(['user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('custom_products');
    }
};