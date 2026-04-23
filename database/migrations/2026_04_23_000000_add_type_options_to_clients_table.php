<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE clients MODIFY COLUMN type ENUM('BLU', 'BLUD', 'PTNBH', 'Lembaga', 'Yayasan', 'Perusahaan Swasta', 'BUMN') NOT NULL");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE clients MODIFY COLUMN type ENUM('BLU', 'BLUD', 'PTNBH') NOT NULL");
    }
};
