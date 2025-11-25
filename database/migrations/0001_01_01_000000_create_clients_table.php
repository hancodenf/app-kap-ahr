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
        Schema::create('clients', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('slug')->unique();
            $table->string('name');
            $table->string('alamat');
            $table->enum('kementrian', [
                'Kementerian Kesehatan',
                'Kementerian Perhubungan',
                'Kementerian Agama',
                'Kementerian Pendidikan',
                'Kementerian Pertanian',
                'Kementerian Keuangan'
            ]);
            $table->string('kode_satker');
            $table->enum('type', ['BLU', 'BLUD', 'PTNBH']);
            $table->string('logo')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('clients');
    }
};
