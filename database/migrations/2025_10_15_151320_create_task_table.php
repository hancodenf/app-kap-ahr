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
        Schema::create('tasks', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->integer('order')->default(0);
            $table->string('name');
            $table->string('slug')->unique();
            
            // Foreign key references (nullable untuk denormalisasi)
            $table->uuid('project_id')->nullable();
            $table->foreign('project_id')->references('id')->on('projects')->onDelete('set null');
            $table->uuid('working_step_id')->nullable();
            $table->foreign('working_step_id')->references('id')->on('working_steps')->onDelete('set null');
            
            // Denormalized project data
            $table->string('project_name');
            $table->string('project_client_name');
            
            // Denormalized working step data
            $table->string('working_step_name');

            $table->enum('client_interact', ['read only', 'comment', 'upload'])->default('read only'); // default read only
            $table->boolean('multiple_files')->default(false); // default single file
            
            // Task requirement & progress tracking
            $table->boolean('is_required')->default(false); // Required to unlock next step
            $table->enum('completion_status', ['pending', 'in_progress', 'completed'])->default('pending');
            $table->string('status')->default('Draft');

            // $table->enum('status', [
            //     'Draft',
            //     'Submitted',
            //     'Under Review by Team Leader',
            //     'Approved by Team Leader',
            //     'Returned for Revision (by Team Leader)',
            //     'Waiting for Manager review',
            //     'Under Review by Manager',
            //     'Approved by Manager',
            //     'Returned for Revision (by Manager)',
            //     'Waiting for Supervisor review',
            //     'Under Review by Supervisor',
            //     'Approved by Supervisor',
            //     'Returned for Revision (by Supervisor)',
            //     'Waiting for Partner review',
            //     'Under Review by Partner',
            //     'Approved by Partner',
            //     'Returned for Revision (by Partner)',
            //     'Submitted to Client',
            //     'Under Review by Client',
            //     'Returned for Revision (by Client)',
            //     'Client Reply',
            //     'Approved by Client'
            // ])->default('Draft');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
