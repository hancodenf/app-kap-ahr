<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE clients MODIFY COLUMN kementrian ENUM('Kementerian Kesehatan', 'Kementerian Perhubungan', 'Kementerian Agama', 'Kementerian Pendidikan', 'Kementerian Pertanian', 'Kementerian Keuangan', 'Lainnya') NOT NULL");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE clients MODIFY COLUMN kementrian ENUM('Kementerian Kesehatan', 'Kementerian Perhubungan', 'Kementerian Agama', 'Kementerian Pendidikan', 'Kementerian Pertanian', 'Kementerian Keuangan') NOT NULL");
    }
};
