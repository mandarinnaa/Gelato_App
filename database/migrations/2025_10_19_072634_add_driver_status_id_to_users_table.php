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
        Schema::table('users', function (Blueprint $table) {
            // Agregar driver_status_id a la tabla users
            $table->foreignId('driver_status_id')
                  ->nullable()
                  ->after('membership_id')
                  ->constrained('driver_statuses')
                  ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Eliminar la FK y la columna
            $table->dropForeign(['driver_status_id']);
            $table->dropColumn('driver_status_id');
        });
    }
};