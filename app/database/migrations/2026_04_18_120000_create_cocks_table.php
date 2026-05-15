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
        Schema::create('cocks', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('player_id')->nullable();
            $table->string('code', 20);

            $table->string('cock_name', 200)->nullable();
            $table->string('cock_alias', 200)->nullable();
            $table->string('cock_stand', 200)->nullable();
            $table->string('color', 200)->nullable();
            $table->string('breed', 200)->nullable();

            $table->decimal('weight', 20, 2)->default(0.00);
            $table->decimal('height', 20, 2)->default(0.00);
            $table->unsignedBigInteger('age')->default(0);
            $table->dateTime('hatch_date')->nullable();
            $table->string('origin', 200)->nullable();

            $table->enum('status', ['active', 'in-active'])->default('in-active');

            $table->timestamps();

            $table->index(['cock_name'], 'index_cockname_1');
            $table->index(['id', 'cock_name', 'weight'], 'index_cockfightmatch');
            $table->index(['cock_alias'], 'index_cockalias_1');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cocks');
    }
};
