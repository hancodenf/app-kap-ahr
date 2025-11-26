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
        Schema::create('task_approvals', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->integer('order')->default(0);
            $table->uuid('task_id')->nullable();
            $table->foreign('task_id')->references('id')->on('tasks')->onDelete('set null');
            $table->enum('role', ['partner', 'manager', 'supervisor', 'team leader'])->default('team leader');
            
            // Denormalized working sub step data
            $table->string('task_name');
            $table->string('working_step_name');
            $table->string('project_name');
            $table->string('project_client_name');


            $table->string('status_name_pending')->nullable();
            $table->string('status_name_progress')->nullable();
            $table->string('status_name_reject')->nullable();
            $table->string('status_name_complete')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('task_approvals');
    }
};
