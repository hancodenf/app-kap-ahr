<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Fix target_id column type from bigint to char(36) for UUID support
     */
    public function up(): void
    {
        Schema::table('activity_logs', function (Blueprint $table) {
            // Drop existing index first if exists
            try {
                $table->dropIndex(['target_type', 'target_id']);
            } catch (\Exception $e) {
                // Index might not exist, continue
            }
            
            // Drop existing target_id column
            $table->dropColumn('target_id');
        });

        Schema::table('activity_logs', function (Blueprint $table) {
            // Add target_id back as char(36) for UUID support
            $table->char('target_id', 36)->nullable()->after('target_type');
            
            // Re-add index for polymorphic relationship
            $table->index(['target_type', 'target_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('activity_logs', function (Blueprint $table) {
            // Drop the index first
            try {
                $table->dropIndex(['target_type', 'target_id']);
            } catch (\Exception $e) {
                // Index might not exist, continue
            }
            
            // Drop the UUID target_id column
            $table->dropColumn('target_id');
        });

        Schema::table('activity_logs', function (Blueprint $table) {
            // Restore original bigint target_id
            $table->bigInteger('target_id')->unsigned()->nullable()->after('target_type');
            
            // Re-add original index
            $table->index(['target_type', 'target_id']);
        });
    }
};
