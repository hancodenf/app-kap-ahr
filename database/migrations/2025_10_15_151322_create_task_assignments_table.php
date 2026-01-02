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
        Schema::create('task_assignments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('task_id')->nullable();
            $table->foreign('task_id')->references('id')->on('tasks')->onDelete('set null');
            
            // Denormalized working sub step data
            $table->string('task_name');
            $table->string('working_step_name');
            $table->string('project_name');
            $table->string('project_client_name');

            $table->timestamp('time')->nullable();
            $table->longText('comment')->nullable();
            $table->longText('notes')->nullable();
            $table->longText('client_comment')->nullable();
            $table->string('status')->nullable();
            $table->enum('maker', ['client', 'company'])->default('company');
            $table->boolean('maker_can_edit')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('task_assignments');
    }
};
