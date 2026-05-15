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
        Schema::create('users', function (Blueprint $table) {
            $table->id();

            // Basic Info
            $table->string('code', 20)->nullable();
            $table->string('first_name', 20)->nullable();
            $table->string('middle_name', 20)->nullable();
            $table->string('last_name', 20)->nullable();
            $table->string('name', 60)->nullable();

            // Auth
            $table->string('email', 50)->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password'); // hashed
            $table->rememberToken();

            // Personal Info
            $table->date('birthdate')->nullable();
            $table->date('joindate')->nullable();
            $table->string('contact_no', 20)->unique()->nullable();

            // Address
            $table->string('address_1', 200)->nullable();
            $table->string('address_2', 200)->nullable();
            $table->string('town', 50)->nullable();
            $table->string('city', 50)->nullable();
            $table->string('country', 50)->nullable();
            $table->string('postal_code', 20)->nullable();

            // UI Preferences
            $table->string('backend_themecolor', 200)->nullable();
            $table->string('frontend_themecolor', 200)->nullable();

            // Access Control
            $table->string('access_level', 50)->nullable();

            $table->enum('status', ['active', 'in-active'])
                ->default('in-active');

            // Media
            $table->string('photo_path', 255)->nullable();

            // Audit
            $table->timestamp('last_updateddate')->nullable();
            $table->timestamp('last_logindate')->nullable();

            $table->timestamps();

            // Indexes
            $table->index(['first_name', 'last_name'], 'index_name');
            $table->index(['id', 'status'], 'index_status');
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
