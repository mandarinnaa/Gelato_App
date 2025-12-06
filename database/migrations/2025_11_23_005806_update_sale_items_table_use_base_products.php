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
        Schema::table('sale_items', function (Blueprint $table) {
            // Eliminar la constraint antigua si existe
            $table->dropForeign(['product_id']);
            
            // Agregar la nueva constraint apuntando a base_products
            $table->foreign('product_id')
                  ->references('id')
                  ->on('base_products')
                  ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sale_items', function (Blueprint $table) {
            // Revertir: volver a apuntar a products
            $table->dropForeign(['product_id']);
            
            $table->foreign('product_id')
                  ->references('id')
                  ->on('products')
                  ->onDelete('cascade');
        });
    }
};