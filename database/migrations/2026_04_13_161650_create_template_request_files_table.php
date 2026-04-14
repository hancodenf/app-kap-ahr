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
        Schema::create('template_request_files', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->longText('request_list')->nullable();
            $table->uuid('project_template_id')->nullable();
            $table->foreign('project_template_id')->references('id')->on('project_templates');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('template_request_files');
    }
};
