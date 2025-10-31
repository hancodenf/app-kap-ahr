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
        Schema::create('template_tasks', function (Blueprint $table) {
            $table->id();
            $table->integer('order')->default(0);
            $table->string('name');
            $table->string('slug')->unique();
            $table->unsignedBigInteger('project_template_id')->nullable();
            $table->foreign('project_template_id')->references('id')->on('project_templates');
            $table->unsignedBigInteger('template_working_step_id')->nullable();
            $table->foreign('template_working_step_id')->references('id')->on('template_working_steps')->onDelete('cascade');
            $table->timestamp('time')->nullable();
            $table->text('comment')->nullable();
            $table->text('client_comment')->nullable();
            $table->boolean('client_interact')->default(false); // default read only
            $table->boolean('multiple_files')->default(false); // default single file
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('template_tasks');
    }
};
