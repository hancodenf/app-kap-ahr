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
            $table->uuid('id')->primary();
            
            // Foreign key reference (nullable untuk denormalisasi)
            $table->uuid('task_assignment_id')->nullable();
            $table->foreign('task_assignment_id')->references('id')->on('task_assignments')->onDelete('set null');            
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('file')->nullable();
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
