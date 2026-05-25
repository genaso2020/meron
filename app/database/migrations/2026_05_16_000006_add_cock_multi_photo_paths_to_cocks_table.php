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
            $table->string('front_photo_path', 255)->nullable()->after('photo_path');
            $table->string('left_photo_path', 255)->nullable()->after('front_photo_path');
            $table->string('right_photo_path', 255)->nullable()->after('left_photo_path');
            $table->string('action_photo_path', 255)->nullable()->after('right_photo_path');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cocks', function (Blueprint $table) {
            $table->dropColumn([
                'front_photo_path',
                'left_photo_path',
                'right_photo_path',
                'action_photo_path',
            ]);
        });
    }
};
