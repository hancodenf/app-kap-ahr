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
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('is_suspended')->default(false)->after('email_verified_at');
            $table->timestamp('suspended_until')->nullable()->after('is_suspended');
            $table->integer('failed_login_count')->default(0)->after('suspended_until');
            $table->timestamp('last_failed_login')->nullable()->after('failed_login_count');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['is_suspended', 'suspended_until', 'failed_login_count', 'last_failed_login']);
        });
    }
};
