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
        Schema::table('matches', function (Blueprint $table) {
            $table->decimal('min_bet_amount', 12, 2)->default(0)->after('status');
            $table->decimal('max_bet_amount', 12, 2)->default(0)->after('min_bet_amount');

            $table->index(['min_bet_amount'], 'index_match_min_bet_amount');
            $table->index(['max_bet_amount'], 'index_match_max_bet_amount');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('matches', function (Blueprint $table) {
            $table->dropIndex('index_match_min_bet_amount');
            $table->dropIndex('index_match_max_bet_amount');
            $table->dropColumn(['min_bet_amount', 'max_bet_amount']);
        });
    }
};
