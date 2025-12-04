<?php
// database/migrations/2025_11_27_000002_add_rating_stats_to_base_products.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('base_products', function (Blueprint $table) {
            $table->decimal('average_rating', 2, 1)->default(0)->after('featured');
            $table->integer('total_reviews')->default(0)->after('average_rating');
            
            $table->index('average_rating');
        });
    }

    public function down(): void
    {
        Schema::table('base_products', function (Blueprint $table) {
            $table->dropColumn(['average_rating', 'total_reviews']);
        });
    }
};