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
            DB::statement("UPDATE `matches` SET `status` = 'pending' WHERE `status` = 'active'");
            DB::statement("ALTER TABLE `matches` MODIFY `status` ENUM('pending','play','stop','done') NOT NULL DEFAULT 'pending'");
        }
    }
};
