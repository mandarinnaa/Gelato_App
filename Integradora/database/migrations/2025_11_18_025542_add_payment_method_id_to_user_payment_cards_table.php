<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('user_payment_cards', function (Blueprint $table) {
            // Solo agregar la columna si no existe
            if (!Schema::hasColumn('user_payment_cards', 'payment_method_id')) {
                $table->foreignId('payment_method_id')
                      ->after('user_id')
                      ->constrained('payment_methods')
                      ->onDelete('cascade');
            }
        });
    }

    public function down(): void
    {
        Schema::table('user_payment_cards', function (Blueprint $table) {
            if (Schema::hasColumn('user_payment_cards', 'payment_method_id')) {
                $table->dropForeign(['payment_method_id']);
                $table->dropColumn('payment_method_id');
            }
        });
    }
};
