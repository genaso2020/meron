<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $driver = Schema::getConnection()->getDriverName();

        if ($driver === 'mysql') {
            DB::statement("ALTER TABLE `matches` MODIFY `status` ENUM('pending','active','ongoing','play','stop','done') NOT NULL DEFAULT 'pending'");

            DB::statement("UPDATE `matches` SET `status` = 'play' WHERE `status` = 'ongoing'");
            DB::statement("UPDATE `matches` SET `status` = 'pending' WHERE `status` IS NULL OR `status` = ''");

            DB::statement("ALTER TABLE `matches` MODIFY `status` ENUM('pending','active','play','stop','done') NOT NULL DEFAULT 'pending'");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $driver = Schema::getConnection()->getDriverName();

        if ($driver === 'mysql') {
            DB::statement("ALTER TABLE `matches` MODIFY `status` ENUM('pending','active','ongoing','play','stop','done') NOT NULL DEFAULT 'pending'");

            DB::statement("UPDATE `matches` SET `status` = 'ongoing' WHERE `status` = 'play'");

            DB::statement("ALTER TABLE `matches` MODIFY `status` ENUM('pending','active','ongoing','done') NOT NULL DEFAULT 'pending'");
        }
    }
};
