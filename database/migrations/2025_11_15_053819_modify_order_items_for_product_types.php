<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Obtener el nombre de la base de datos
        $databaseName = DB::connection()->getDatabaseName();
        
        // Paso 1: Eliminar la foreign key de product_id
        $foreignKeys = DB::select("
            SELECT CONSTRAINT_NAME
            FROM information_schema.KEY_COLUMN_USAGE
            WHERE TABLE_SCHEMA = ? 
            AND TABLE_NAME = 'order_items'
            AND COLUMN_NAME = 'product_id'
            AND REFERENCED_TABLE_NAME IS NOT NULL
        ", [$databaseName]);

        foreach ($foreignKeys as $fk) {
            DB::statement("ALTER TABLE order_items DROP FOREIGN KEY {$fk->CONSTRAINT_NAME}");
        }

        // Paso 2: Modificar la tabla
        Schema::table('order_items', function (Blueprint $table) {
            // Hacer product_id nullable
            $table->unsignedBigInteger('product_id')->nullable()->change();
            
            // Agregar tipo de producto
            $table->enum('product_type', ['base', 'custom'])->after('order_id')->nullable();
            
            // Agregar relaciones
            $table->foreignId('base_product_id')->nullable()->after('product_id')
                ->constrained('base_products')->onDelete('set null');
            
            $table->foreignId('custom_product_id')->nullable()->after('base_product_id')
                ->constrained('custom_products')->onDelete('set null');
            
            // Información del producto al momento de la compra (snapshot)
            $table->string('product_name')->after('custom_product_id')->nullable();
            $table->text('product_details')->nullable()->after('product_name'); // JSON: sabor, tamaño, relleno, toppings
        });
    }

    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            // Eliminar foreign keys
            $table->dropForeign(['base_product_id']);
            $table->dropForeign(['custom_product_id']);
            
            // Eliminar columnas
            $table->dropColumn([
                'product_type',
                'base_product_id', 
                'custom_product_id', 
                'product_name', 
                'product_details'
            ]);
            
            // Restaurar product_id como NOT NULL
            $table->unsignedBigInteger('product_id')->nullable(false)->change();
        });
        
        // Restaurar foreign key de product_id
        Schema::table('order_items', function (Blueprint $table) {
            $table->foreign('product_id')->references('id')->on('base_products')->onDelete('cascade');
        });
    }
};