<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Add comprehensive race condition protection to all critical tables
     */
    public function up(): void
    {
        // 🔒 1. TASK ASSIGNMENTS - Critical for concurrent submissions/edits
        Schema::table('task_assignments', function (Blueprint $table) {
            $table->integer('version')->default(0)->after('maker_can_edit');
            $table->timestamp('last_modified_at')->nullable()->after('version');
            $table->uuid('last_modified_by')->nullable()->after('last_modified_at');
            $table->index(['version', 'id'], 'idx_task_assignments_version');
            $table->index(['task_id', 'status'], 'idx_task_assignments_task_status');
            
            // Add foreign key for last_modified_by
            $table->foreign('last_modified_by')->references('id')->on('users')->onDelete('set null');
        });

        // 🔒 2. TASKS - Critical for concurrent task updates
        Schema::table('tasks', function (Blueprint $table) {
            $table->integer('version')->default(0)->after('completed_at');
            $table->timestamp('last_modified_at')->nullable()->after('version');
            $table->uuid('last_modified_by')->nullable()->after('last_modified_at');
            $table->index(['version', 'id'], 'idx_tasks_version');
            $table->index(['completion_status', 'approval_type'], 'idx_tasks_completion_approval');
            
            // Add foreign key for last_modified_by
            $table->foreign('last_modified_by')->references('id')->on('users')->onDelete('set null');
        });

        // 🔒 3. PROJECTS - Critical for concurrent project updates  
        Schema::table('projects', function (Blueprint $table) {
            $table->integer('version')->default(0)->after('client_kode_satker');
            $table->timestamp('last_modified_at')->nullable()->after('version');
            $table->uuid('last_modified_by')->nullable()->after('last_modified_at');
            $table->index(['version', 'id'], 'idx_projects_version');
            $table->index(['status', 'client_id'], 'idx_projects_status_client');
            
            // Add foreign key for last_modified_by
            $table->foreign('last_modified_by')->references('id')->on('users')->onDelete('set null');
        });

        // 🔒 4. PROJECT TEAMS - Critical for concurrent team assignments
        Schema::table('project_teams', function (Blueprint $table) {
            $table->integer('version')->default(0)->after('role');
            $table->timestamp('last_modified_at')->nullable()->after('version');
            $table->uuid('last_modified_by')->nullable()->after('last_modified_at');
            $table->index(['version', 'id'], 'idx_project_teams_version');
            
            // Prevent duplicate team assignments  
            $table->unique(['project_id', 'user_id'], 'unique_project_team_assignment');
            
            // Add foreign key for last_modified_by
            $table->foreign('last_modified_by')->references('id')->on('users')->onDelete('set null');
        });

        // 🔒 5. WORKING STEPS - Critical for progress updates
        Schema::table('working_steps', function (Blueprint $table) {
            $table->integer('version')->default(0)->after('slug');
            $table->timestamp('last_modified_at')->nullable()->after('version');
            $table->uuid('last_modified_by')->nullable()->after('last_modified_at');
            $table->index(['version', 'id'], 'idx_working_steps_version');
            $table->index(['project_id', 'order'], 'idx_working_steps_project_order');
            
            // Add foreign key for last_modified_by
            $table->foreign('last_modified_by')->references('id')->on('users')->onDelete('set null');
        });

        // 🔒 6. USERS - Critical for login security and profile updates
        Schema::table('users', function (Blueprint $table) {
            $table->integer('version')->default(0)->after('last_failed_login');
            $table->timestamp('last_modified_at')->nullable()->after('version');
            $table->uuid('last_modified_by')->nullable()->after('last_modified_at');
            $table->index(['version', 'id'], 'idx_users_version');
            $table->index(['email', 'is_suspended'], 'idx_users_email_suspended');
            
            // Add foreign key for last_modified_by (self-referencing)
            $table->foreign('last_modified_by')->references('id')->on('users')->onDelete('set null');
        });

        // 🔒 7. CLIENT DOCUMENTS - Critical for concurrent document uploads
        Schema::table('client_documents', function (Blueprint $table) {
            $table->integer('version')->default(0)->after('uploaded_at');
            $table->timestamp('last_modified_at')->nullable()->after('version');
            $table->uuid('last_modified_by')->nullable()->after('last_modified_at');
            $table->index(['version', 'id'], 'idx_client_documents_version');
            $table->index(['task_assignment_id', 'name'], 'idx_client_docs_assignment_name');
            
            // Add foreign key for last_modified_by
            $table->foreign('last_modified_by')->references('id')->on('users')->onDelete('set null');
        });

        // 🔒 8. DOCUMENTS - Critical for concurrent document management
        Schema::table('documents', function (Blueprint $table) {
            $table->integer('version')->default(0)->after('uploaded_at');
            $table->timestamp('last_modified_at')->nullable()->after('version');
            $table->uuid('last_modified_by')->nullable()->after('last_modified_at');
            $table->index(['version', 'id'], 'idx_documents_version');
            $table->index(['task_assignment_id', 'name'], 'idx_docs_assignment_name');
            
            // Add foreign key for last_modified_by
            $table->foreign('last_modified_by')->references('id')->on('users')->onDelete('set null');
        });

        // 🔒 9. TASK WORKERS - Critical for concurrent team assignments
        Schema::table('task_workers', function (Blueprint $table) {
            $table->integer('version')->default(0)->after('worker_role');
            $table->timestamp('last_modified_at')->nullable()->after('version');
            $table->uuid('last_modified_by')->nullable()->after('last_modified_at');
            $table->index(['version', 'id'], 'idx_task_workers_version');
            $table->index(['task_id', 'project_team_id'], 'idx_task_workers_task_team');
            
            // Add foreign key for last_modified_by
            $table->foreign('last_modified_by')->references('id')->on('users')->onDelete('set null');
        });

        // 🔒 10. ACTIVITY LOGS - Add indexes for better performance
        Schema::table('activity_logs', function (Blueprint $table) {
            $table->index(['user_id', 'created_at'], 'idx_activity_logs_user_created');
            $table->index(['target_type', 'target_id', 'created_at'], 'idx_activity_logs_target_created');
        });

        // 🔒 10. FAILED LOGIN ATTEMPTS - Add indexes for security monitoring
        Schema::table('failed_login_attempts', function (Blueprint $table) {
            $table->index(['email', 'attempted_at'], 'idx_failed_login_email_attempted');
            $table->index(['ip_address', 'attempted_at'], 'idx_failed_login_ip_attempted');
        });

        // 🔒 11. Add unique constraints to prevent duplicate critical records
        
        // Prevent duplicate task approvals for same task-role combination
        try {
            Schema::table('task_approvals', function (Blueprint $table) {
                $table->unique(['task_id', 'role', 'order'], 'unique_task_approval_role_order');
            });
        } catch (\Exception $e) {
            // Index might already exist, continue
        }

        // Prevent duplicate task workers for same task-team combination  
        try {
            Schema::table('task_workers', function (Blueprint $table) {
                $table->unique(['task_id', 'project_team_id'], 'unique_task_worker_assignment');
            });
        } catch (\Exception $e) {
            // Index might already exist, continue
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop unique constraints first
        try {
            Schema::table('task_workers', function (Blueprint $table) {
                $table->dropUnique('unique_task_worker_assignment');
            });
        } catch (\Exception $e) {
            // Ignore if doesn't exist
        }

        try {
            Schema::table('task_approvals', function (Blueprint $table) {
                $table->dropUnique('unique_task_approval_role_order');
            });
        } catch (\Exception $e) {
            // Ignore if doesn't exist
        }

        // Drop indexes and columns from all tables
        $tables = [
            'task_assignments', 'tasks', 'projects', 'project_teams', 
            'working_steps', 'users', 'client_documents', 'documents', 'task_workers'
        ];

        foreach ($tables as $tableName) {
            try {
                Schema::table($tableName, function (Blueprint $table) use ($tableName) {
                    try {
                        $table->dropForeign(['last_modified_by']);
                    } catch (\Exception $e) {
                        // Ignore if doesn't exist
                    }
                    
                    try {
                        $table->dropIndex("idx_{$tableName}_version");
                    } catch (\Exception $e) {
                        // Ignore if doesn't exist
                    }
                    
                    try {
                        $table->dropColumn(['version', 'last_modified_at', 'last_modified_by']);
                    } catch (\Exception $e) {
                        // Ignore if doesn't exist
                    }
                });
            } catch (\Exception $e) {
                // Continue with next table
            }
        }

        // Drop specific indexes
        try {
            Schema::table('project_teams', function (Blueprint $table) {
                $table->dropUnique('unique_project_team_assignment');
            });
        } catch (\Exception $e) {
            // Ignore if doesn't exist
        }

        try {
            Schema::table('activity_logs', function (Blueprint $table) {
                $table->dropIndex('idx_activity_logs_user_created');
                $table->dropIndex('idx_activity_logs_target_created');
            });
        } catch (\Exception $e) {
            // Ignore if doesn't exist
        }

        try {
            Schema::table('failed_login_attempts', function (Blueprint $table) {
                $table->dropIndex('idx_failed_login_email_attempted');
                $table->dropIndex('idx_failed_login_ip_attempted');
            });
        } catch (\Exception $e) {
            // Ignore if doesn't exist
        }
    }
};
