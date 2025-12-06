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
        
        // Paso 1: Obtener todas las foreign keys y constraints de cart_items
        $constraints = DB::select("
            SELECT CONSTRAINT_NAME, CONSTRAINT_TYPE
            FROM information_schema.TABLE_CONSTRAINTS
            WHERE TABLE_SCHEMA = ? 
            AND TABLE_NAME = 'cart_items'
            AND CONSTRAINT_TYPE IN ('FOREIGN KEY', 'UNIQUE')
        ", [$databaseName]);

        // Eliminar primero todas las foreign keys
        foreach ($constraints as $constraint) {
            if ($constraint->CONSTRAINT_TYPE === 'FOREIGN KEY') {
                try {
                    DB::statement("ALTER TABLE cart_items DROP FOREIGN KEY {$constraint->CONSTRAINT_NAME}");
                } catch (\Exception $e) {
                    // Continuar si ya no existe
                }
            }
        }

        // Ahora eliminar los índices únicos
        foreach ($constraints as $constraint) {
            if ($constraint->CONSTRAINT_TYPE === 'UNIQUE' && 
                strpos($constraint->CONSTRAINT_NAME, 'cart_id_product_id') !== false) {
                try {
                    DB::statement("ALTER TABLE cart_items DROP INDEX {$constraint->CONSTRAINT_NAME}");
                } catch (\Exception $e) {
                    // Continuar si ya no existe
                }
            }
        }

        // Paso 3: Modificar la tabla
        Schema::table('cart_items', function (Blueprint $table) {
            // Hacer product_id nullable
            $table->unsignedBigInteger('product_id')->nullable()->change();
            
            // Agregar tipo de producto
            $table->enum('product_type', ['base', 'custom'])->after('cart_id')->nullable();
            
            // Agregar relación con productos base
            $table->foreignId('base_product_id')->nullable()->after('product_id')
                ->constrained('base_products')->onDelete('cascade');
            
            // Agregar relación con productos personalizados
            $table->foreignId('custom_product_id')->nullable()->after('base_product_id')
                ->constrained('custom_products')->onDelete('cascade');
            
            // Agregar size_id para productos base (el cliente elige el tamaño)
            $table->foreignId('size_id')->nullable()->after('custom_product_id')
                ->constrained('sizes');
        });
    }

    public function down(): void
    {
        Schema::table('cart_items', function (Blueprint $table) {
            // Eliminar foreign keys agregadas
            $table->dropForeign(['base_product_id']);
            $table->dropForeign(['custom_product_id']);
            $table->dropForeign(['size_id']);
            
            // Eliminar columnas agregadas
            $table->dropColumn([
                'product_type',
                'base_product_id', 
                'custom_product_id', 
                'size_id'
            ]);
            
            // Restaurar product_id como NOT NULL
            $table->unsignedBigInteger('product_id')->nullable(false)->change();
        });
        
        // Restaurar foreign key de product_id
        Schema::table('cart_items', function (Blueprint $table) {
            $table->foreign('product_id')->references('id')->on('base_products')->onDelete('cascade');
        });
        
        // Restaurar unique constraint
        Schema::table('cart_items', function (Blueprint $table) {
            $table->unique(['cart_id', 'product_id']);
        });
    }
};