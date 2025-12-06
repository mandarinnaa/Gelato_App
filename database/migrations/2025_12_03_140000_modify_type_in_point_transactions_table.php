<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement("ALTER TABLE point_transactions MODIFY COLUMN type ENUM('earned', 'redeemed', 'expired', 'adjusted', 'refunded') NOT NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Nota: Esto podría fallar si hay registros con 'refunded'
        DB::statement("ALTER TABLE point_transactions MODIFY COLUMN type ENUM('earned', 'redeemed', 'expired', 'adjusted') NOT NULL");
    }
};
