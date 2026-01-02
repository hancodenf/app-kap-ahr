<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();

            // 🔹 Data user yang melakukan aksi
            $table->uuid('user_id')->nullable();
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');

            $table->string('user_name')->nullable();
            $table->string('user_email')->nullable();
            $table->string('user_role')->nullable();

            // 🔹 Jenis aktivitas dan tindakan
            $table->string('action_type'); // project, task, document, dll
            $table->string('action'); // create, update, delete, assign, dll

            // 🔹 Target (polymorphic)
            $table->nullableMorphs('target'); // target_type + target_id

            // 🔹 Snapshot nama target (agar tetap ada walau target dihapus)
            $table->string('target_name')->nullable();

            // 🔹 Deskripsi dan konteks tambahan
            $table->text('description')->nullable();

            // 🔹 Data tambahan dalam bentuk JSON
            $table->json('meta')->nullable();

            // 🔹 Info teknis (untuk audit)
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent')->nullable();

            $table->timestamps();

            // 🔹 Index untuk query cepat
            $table->index(['action_type', 'action']);
            // Note: nullableMorphs already creates index for target_type and target_id
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
