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
        Schema::create('working_steps', function (Blueprint $table) {
            $table->id();
            $table->integer('order')->default(0);
            $table->boolean('is_locked')->default(true); // Locked by default, except for first step
            
            // Foreign key reference (nullable untuk denormalisasi)
            $table->unsignedBigInteger('project_id')->nullable();
            $table->foreign('project_id')->references('id')->on('projects')->onDelete('set null');
            
            // Denormalized project data
            $table->string('project_name');
            $table->string('project_client_name');
            
            $table->string('name');
            $table->string('slug')->unique();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('working_steps');
    }
};
