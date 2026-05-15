<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cocks', function (Blueprint $table) {
            if (Schema::hasColumn('cocks', 'cock_entry_number')) {
                return;
            }

            $table->unsignedInteger('cock_entry_number')->nullable()->after('cock_name');
            $table->index(['cock_entry_number'], 'index_cock_entry_number');
        });
    }

    public function down(): void
    {
        Schema::table('cocks', function (Blueprint $table) {
            if (!Schema::hasColumn('cocks', 'cock_entry_number')) {
                return;
            }

            $table->dropIndex('index_cock_entry_number');
            $table->dropColumn('cock_entry_number');
        });
    }
};
