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
        Schema::create('matches', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('event_id');
            $table->unsignedBigInteger('fight_number')->default(0);
            $table->dateTime('schedule_time')->nullable();
            $table->enum('status', ['pending', 'ongoing', 'done'])->default('pending');

            $table->timestamps();

            $table->index(['event_id'], 'index_match_event');
            $table->index(['event_id', 'fight_number'], 'index_match_event_fight');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('matches');
    }
};
