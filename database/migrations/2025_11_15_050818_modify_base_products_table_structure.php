<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('base_products', function (Blueprint $table) {
            // Agregar nueva columna
            $table->boolean('is_customizable')->default(false)->after('featured');
        });

        // Obtener el nombre real de las foreign keys
        $foreignKeys = $this->getForeignKeys('base_products');
        
        Schema::table('base_products', function (Blueprint $table) use ($foreignKeys) {
            // Eliminar foreign keys si existen
            foreach ($foreignKeys as $fk) {
                if (in_array($fk['column'], ['size_id', 'filling_id', 'base_price_id'])) {
                    $table->dropForeign($fk['name']);
                }
            }
            
            // Eliminar columnas
            $table->dropColumn(['size_id', 'filling_id', 'base_price_id', 'final_price', 'stock']);
        });
        
        // Eliminar tabla pivote de toppings
        Schema::dropIfExists('product_topping');
    }

    public function down(): void
    {
        Schema::table('base_products', function (Blueprint $table) {
            $table->dropColumn('is_customizable');
            
            $table->foreignId('size_id')->nullable()->constrained('sizes');
            $table->foreignId('filling_id')->nullable()->constrained('fillings');
            $table->foreignId('base_price_id')->nullable()->constrained('base_prices');
            $table->decimal('final_price', 10, 2)->nullable();
            $table->integer('stock')->default(0);
        });
        
        // Recrear tabla pivote
        Schema::create('product_topping', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('base_products')->onDelete('cascade');
            $table->foreignId('topping_id')->constrained('toppings')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Obtener las foreign keys de una tabla
     */
    private function getForeignKeys($tableName)
    {
        $databaseName = DB::connection()->getDatabaseName();
        
        $foreignKeys = DB::select("
            SELECT 
                CONSTRAINT_NAME as name,
                COLUMN_NAME as `column`
            FROM information_schema.KEY_COLUMN_USAGE
            WHERE TABLE_SCHEMA = ? 
            AND TABLE_NAME = ?
            AND REFERENCED_TABLE_NAME IS NOT NULL
        ", [$databaseName, $tableName]);
        
        return array_map(function($fk) {
            return [
                'name' => $fk->name,
                'column' => $fk->column
            ];
        }, $foreignKeys);
    }
};