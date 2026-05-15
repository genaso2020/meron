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
        Schema::create('games', function (Blueprint $table) {
            $table->id();

            $table->string('name', 200);
            $table->string('location', 200)->nullable();
            $table->date('date')->nullable();
            $table->text('details1')->nullable();
            $table->text('details2')->nullable();

            $table->timestamps();

            $table->index(['name'], 'index_game_name');
            $table->index(['date'], 'index_game_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('games');
    }
};
