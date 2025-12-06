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
            $table->timestamp('membership_expires_at')->nullable()->after('membership_id');
            $table->timestamp('membership_cancelled_at')->nullable()->after('membership_expires_at');
            $table->boolean('membership_auto_renew')->default(true)->after('membership_cancelled_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['membership_expires_at', 'membership_cancelled_at', 'membership_auto_renew']);
        });
    }
};
