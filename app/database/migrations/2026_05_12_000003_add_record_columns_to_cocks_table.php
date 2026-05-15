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
        Schema::table('cocks', function (Blueprint $table) {
            $table->unsignedInteger('wins')->default(0)->after('fighting_style_id');
            $table->unsignedInteger('draws')->default(0)->after('wins');
            $table->unsignedInteger('losses')->default(0)->after('draws');

            $table->index(['wins', 'draws', 'losses'], 'index_cocks_record');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cocks', function (Blueprint $table) {
            $table->dropIndex('index_cocks_record');
            $table->dropColumn(['wins', 'draws', 'losses']);
        });
    }
};
