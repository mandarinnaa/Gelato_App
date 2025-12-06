<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('base_prices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('flavor_id')->constrained('flavors')->onDelete('cascade');
            $table->foreignId('size_id')->constrained('sizes')->onDelete('cascade');
            $table->decimal('price', 8, 2);
            $table->timestamps();

            // Evitar duplicados de combinación flavor-size
            $table->unique(['flavor_id', 'size_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('base_prices');
    }
};