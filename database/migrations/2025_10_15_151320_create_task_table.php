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
            $table->id();
            $table->integer('order')->default(0);
            $table->string('name');
            $table->string('slug')->unique();
            
            // Foreign key references (nullable untuk denormalisasi)
            $table->unsignedBigInteger('project_id')->nullable();
            $table->foreign('project_id')->references('id')->on('projects')->onDelete('set null');
            $table->unsignedBigInteger('working_step_id')->nullable();
            $table->foreign('working_step_id')->references('id')->on('working_steps')->onDelete('set null');
            
            // Denormalized project data
            $table->string('project_name');
            $table->string('project_client_name');
            
            // Denormalized working step data
            $table->string('working_step_name');
            
            $table->timestamp('time')->nullable();
            $table->text('comment')->nullable();
            $table->text('client_comment')->nullable();
            $table->boolean('client_interact')->default(false); // default read only
            $table->boolean('multiple_files')->default(false); // default single file
            $table->enum('status', [
                'Draft',
                'Submitted',
                'Under Review by Team Leader',
                'Approved by Team Leader',
                'Returned for Revision (by Team Leader)',
                'Under Review by Manager',
                'Approved by Manager',
                'Returned for Revision (by Manager)',
                'Under Review by Supervisor',
                'Approved by Supervisor',
                'Returned for Revision (by Supervisor)',
                'Under Review by Partner',
                'Approved by Partner',
                'Returned for Revision (by Partner)',
                'Submitted to Client',
                'Client Reply'
            ])->default('Draft');
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
