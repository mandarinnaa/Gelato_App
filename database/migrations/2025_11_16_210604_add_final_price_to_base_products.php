<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('base_products', function (Blueprint $table) {
            // Solo agregar precio final
            $table->decimal('final_price', 10, 2)->after('flavor_id');
        });
    }

    public function down(): void
    {
        Schema::table('base_products', function (Blueprint $table) {
            $table->dropColumn('final_price');
        });
    }
};