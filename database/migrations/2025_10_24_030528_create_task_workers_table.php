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
        Schema::create('task_workers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            // Foreign key references (nullable untuk denormalisasi)
            $table->uuid('task_id')->nullable();
            $table->foreign('task_id')->references('id')->on('tasks')->onDelete('set null');
            $table->uuid('project_team_id')->nullable();
            $table->foreign('project_team_id')->references('id')->on('project_teams')->onDelete('set null');
            
            // Denormalized working sub step data
            $table->string('task_name');
            $table->string('working_step_name');
            $table->string('project_name');
            $table->string('project_client_name');
            
            // Denormalized project team data
            $table->string('worker_name');
            $table->string('worker_email');
            $table->string('worker_role');
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('task_workers');
    }
};
