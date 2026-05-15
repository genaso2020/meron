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
            $table->string('event_name', 255)->nullable()->after('event_id');
            $table->string('event_location', 255)->nullable()->after('event_name');
            $table->string('event_details1', 255)->nullable()->after('event_location');
            $table->string('event_details2', 255)->nullable()->after('event_details1');
            $table->date('event_date')->nullable()->after('event_details2');

            $table->index(['event_date'], 'index_match_event_date');
            $table->index(['event_id', 'schedule_time'], 'index_match_event_schedule');
            $table->index(['event_id', 'cock1_color'], 'index_match_event_cock1_color');
            $table->index(['event_id', 'cock2_color'], 'index_match_event_cock2_color');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('matches', function (Blueprint $table) {
            $table->dropIndex('index_match_event_date');
            $table->dropIndex('index_match_event_schedule');
            $table->dropIndex('index_match_event_cock1_color');
            $table->dropIndex('index_match_event_cock2_color');

            $table->dropColumn([
                'event_name',
                'event_location',
                'event_details1',
                'event_details2',
                'event_date',
            ]);
        });
    }
};
