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
        Schema::create('players', function (Blueprint $table) {
            $table->id();

            $table->string('first_name', 50);
            $table->string('middle_name', 50)->nullable();
            $table->string('last_name', 50);
            $table->string('contact_no', 20)->nullable();
            $table->string('address', 200)->nullable();
            $table->enum('status', ['active', 'in-active'])->default('active');

            $table->timestamps();

            $table->index(['last_name', 'first_name'], 'index_player_name');
            $table->index(['contact_no'], 'index_player_contact');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('players');
    }
};
