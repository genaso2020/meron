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
            $table->unsignedBigInteger('cock1_id')->nullable()->after('event_id');
            $table->unsignedBigInteger('cock2_id')->nullable()->after('cock1_id');
            $table->string('cock1_color', 20)->nullable()->after('cock2_id');
            $table->string('cock2_color', 20)->nullable()->after('cock1_color');

            $table->index(['event_id', 'cock1_id'], 'index_match_event_cock1');
            $table->index(['event_id', 'cock2_id'], 'index_match_event_cock2');

            $table->foreign('cock1_id')->references('id')->on('cocks')->nullOnDelete();
            $table->foreign('cock2_id')->references('id')->on('cocks')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('matches', function (Blueprint $table) {
            $table->dropForeign(['cock1_id']);
            $table->dropForeign(['cock2_id']);
            $table->dropIndex('index_match_event_cock1');
            $table->dropIndex('index_match_event_cock2');
            $table->dropColumn(['cock1_id', 'cock2_id', 'cock1_color', 'cock2_color']);
        });
    }
};
