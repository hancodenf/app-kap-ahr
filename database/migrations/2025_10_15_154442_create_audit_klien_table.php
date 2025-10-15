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
        Schema::create('audit_klien', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('klien_id');
            $table->unsignedBigInteger('sub_level_id');
            $table->unsignedBigInteger('document_id')->nullable();
            $table->string('document_name')->nullable();
            $table->string('file')->nullable();
            $table->timestamp('time')->nullable();
            $table->text('comment')->nullable();
            $table->enum('acc_partner', ['false', 'true'])->default('false');
            $table->unsignedBigInteger('acc_partner_id')->nullable();
            $table->timestamp('acc_partner_time')->nullable();
            $table->enum('for', ['kap', 'klien'])->default('kap');
            $table->enum('acc_klien', ['false', 'true'])->default('false');
            $table->unsignedBigInteger('acc_klien_id')->nullable();
            $table->timestamp('acc_klien_time')->nullable();
            $table->timestamps();

            $table->foreign('klien_id')->references('id')->on('users');
            $table->foreign('sub_level_id')->references('id')->on('sub_levels');
            $table->foreign('document_id')->references('id')->on('documents');
            $table->foreign('acc_partner_id')->references('id')->on('users');
            $table->foreign('acc_klien_id')->references('id')->on('users');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_klien');
    }
};
