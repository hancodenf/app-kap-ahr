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
        Schema::create('blackbox_test_sessions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('token')->unique();
            $table->string('tester_name')->nullable();
            $table->date('test_date')->nullable();
            $table->string('app_version')->nullable();
            $table->string('browser_platform')->nullable();
            $table->timestamps();
        });

        Schema::create('blackbox_test_results', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('session_id');
            $table->foreign('session_id')->references('id')->on('blackbox_test_sessions')->onDelete('cascade');
            $table->string('module_name');
            $table->integer('test_number');
            $table->string('feature_name');
            $table->text('test_scenario');
            $table->text('expected_result')->nullable();
            $table->text('actual_result')->nullable();
            $table->enum('conclusion', ['valid', 'invalid', 'pending'])->default('pending');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('blackbox_test_results');
        Schema::dropIfExists('blackbox_test_sessions');
    }
};
