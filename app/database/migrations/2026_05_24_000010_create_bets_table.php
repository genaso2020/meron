<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('match_id')->constrained('matches')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedInteger('no_of_bets')->default(1);
            $table->decimal('amount', 12, 2);
            $table->enum('side', ['MERON', 'DRAW', 'WALA']);
            $table->decimal('odds', 8, 4)->nullable();
            $table->decimal('potential_payout', 12, 2)->nullable();
            $table->enum('status', ['pending', 'won', 'lost'])->default('pending');
            $table->timestamps();

            $table->index(['match_id', 'status']);
            $table->index(['match_id', 'side']);
            $table->index(['user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bets');
    }
};
