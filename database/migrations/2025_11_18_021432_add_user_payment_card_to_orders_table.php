<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('user_payment_card_id')
                  ->nullable()
                  ->after('payment_method_id')
                  ->constrained('user_payment_cards')
                  ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['user_payment_card_id']);
            $table->dropColumn('user_payment_card_id');
        });
    }
};