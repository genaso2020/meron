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
        Schema::create('fighting_styles', function (Blueprint $table) {
            $table->id();
            $table->string('name', 200)->unique();
            $table->timestamps();

            $table->index(['name'], 'index_fighting_styles_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fighting_styles');
    }
};
