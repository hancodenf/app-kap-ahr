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
        Schema::create('project_document_requests', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('project_id');
            $table->foreign('project_id')->references('id')->on('projects')->onDelete('cascade');
            $table->uuid('requested_by_user_id');
            $table->foreign('requested_by_user_id')->references('id')->on('users')->onDelete('cascade');
            $table->string('requested_by_name');
            $table->string('requested_by_role');
            $table->string('document_name');
            $table->text('description')->nullable();
            $table->enum('status', ['pending', 'uploaded', 'completed'])->default('pending');
            $table->text('file_path')->nullable();
            $table->timestamp('uploaded_at')->nullable();
            $table->unsignedBigInteger('version')->default(1);
            $table->uuid('last_modified_by')->nullable();
            $table->timestamp('last_modified_at')->nullable();
            $table->timestamps();
            
            // Indexes for performance
            $table->index(['project_id', 'status']);
            $table->index(['requested_by_user_id']);
            $table->index(['version', 'id'], 'idx_project_doc_requests_version');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('project_document_requests');
    }
};
