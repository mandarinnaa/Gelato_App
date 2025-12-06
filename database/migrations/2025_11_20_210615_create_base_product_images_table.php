<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('base_product_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('base_product_id')->constrained('base_products')->onDelete('cascade');
            $table->string('image_path');
            $table->integer('order')->default(0); // Para ordenar las imágenes
            $table->boolean('is_primary')->default(false); // Imagen principal
            $table->timestamps();
            
            $table->index('base_product_id');
            $table->index(['base_product_id', 'order']);
        });

        // Migrar imágenes existentes de la columna 'image' a la nueva tabla
        DB::statement("
            INSERT INTO base_product_images (base_product_id, image_path, `order`, is_primary, created_at, updated_at)
            SELECT id, image, 0, 1, created_at, updated_at
            FROM base_products
            WHERE image IS NOT NULL AND image != ''
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('base_product_images');
    }
};