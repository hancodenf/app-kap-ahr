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
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            
            // Foreign key reference (nullable untuk denormalisasi)
            $table->unsignedBigInteger('working_sub_step_id')->nullable();
            $table->foreign('working_sub_step_id')->references('id')->on('working_sub_steps')->onDelete('set null');
            
            // Denormalized working sub step data
            $table->string('working_sub_step_name');
            $table->string('working_step_name');
            $table->string('project_name');
            $table->string('project_client_name');
            
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('file')->nullable();
            $table->timestamp('uploaded_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
