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
        Schema::create('projects', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('slug')->unique();
            $table->enum('status', ['Draft', 'In Progress', 'Completed', 'Suspended', 'Canceled'])->default('Draft');
            $table->boolean('is_archived')->default(false);
            $table->year('year'); // Project year

            // Foreign key reference (nullable untuk denormalisasi)
            $table->uuid('client_id')->nullable();
            $table->foreign('client_id')->references('id')->on('clients')->onDelete('set null');
            
            // Denormalized client data
            $table->string('client_name');
            $table->string('client_alamat');
            $table->string('client_kementrian');
            $table->string('client_kode_satker');
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
