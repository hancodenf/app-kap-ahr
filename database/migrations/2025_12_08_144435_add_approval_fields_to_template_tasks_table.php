<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('template_tasks', function (Blueprint $table) {
            // Update client_interact enum to include 'approval' option
            $table->enum('client_interact_new', ['read only', 'restricted', 'upload', 'approval'])->default('read only')->after('client_interact');
            
            // Add new approval-related fields
            $table->boolean('can_upload_files')->default(false)->after('client_interact_new');
            $table->json('approval_roles')->nullable()->after('is_required');
            $table->enum('approval_type', ['Once', 'All Attempts'])->default('All Attempts')->after('approval_roles');
        });
        
        // Copy data from old enum to new enum
        DB::statement("UPDATE template_tasks SET client_interact_new = client_interact");
        
        // Drop old column and rename new one
        Schema::table('template_tasks', function (Blueprint $table) {
            $table->dropColumn('client_interact');
        });
        
        Schema::table('template_tasks', function (Blueprint $table) {
            $table->renameColumn('client_interact_new', 'client_interact');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('template_tasks', function (Blueprint $table) {
            // Reverse the enum change
            $table->enum('client_interact_old', ['read only', 'restricted', 'upload'])->default('read only')->after('client_interact');
            
            // Drop new fields
            $table->dropColumn(['can_upload_files', 'approval_roles', 'approval_type']);
        });
        
        // Copy data back
        DB::statement("UPDATE template_tasks SET client_interact_old = CASE WHEN client_interact = 'approval' THEN 'upload' ELSE client_interact END");
        
        // Drop and rename
        Schema::table('template_tasks', function (Blueprint $table) {
            $table->dropColumn('client_interact');
        });
        
        Schema::table('template_tasks', function (Blueprint $table) {
            $table->renameColumn('client_interact_old', 'client_interact');
        });
    }
};
