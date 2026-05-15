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
            $table->unsignedBigInteger('fighting_style_id')->nullable()->after('origin');

            $table->index(['fighting_style_id'], 'index_cocks_fighting_style_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cocks', function (Blueprint $table) {
            $table->dropIndex('index_cocks_fighting_style_id');
            $table->dropColumn('fighting_style_id');
        });
    }
};
