<?php

namespace Database\Seeders;

use App\Models\Level;
use App\Models\SubLevel;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class SubLevelSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get levels by name for mapping
        $levels = Level::all()->keyBy('name');

        $subLevelsData = [
            // Perikatan
            ['level' => 'Perikatan', 'name' => 'Penetapan KAP'],
            ['level' => 'Perikatan', 'name' => 'Kontrak / Perikatan Audit'],
            ['level' => 'Perikatan', 'name' => 'Surat Tugas'],
            ['level' => 'Perikatan', 'name' => 'Surat PIC BPK'],
            ['level' => 'Perikatan', 'name' => 'Schedule Audit'],
            
            // Perencanaan
            ['level' => 'Perencanaan', 'name' => 'Permintaan data - permanent file'],
            ['level' => 'Perencanaan', 'name' => 'Permintaan data - current file'],
            ['level' => 'Perencanaan', 'name' => 'Pembuatan KKP Perencanaan Audit atas auditee'],
            ['level' => 'Perencanaan', 'name' => 'Pembuatan Pertanyaan Inquiry ke manajemen oleh masing masing PIC berdasarkan data tahun lalu (ML) dan sekarang (Laporan Keuangan)'],
            ['level' => 'Perencanaan', 'name' => 'Pengiriman Form A (Penilaian Risiko) ke BPK'],
            ['level' => 'Perencanaan', 'name' => 'Pemenuhan surat representasi awal'],
            
            // Pelaksanaan Audit
            ['level' => 'Pelaksanaan Audit', 'name' => 'Fieldwork Stock Opname'],
            ['level' => 'Pelaksanaan Audit', 'name' => 'Fieldwork Aset Opname'],
            ['level' => 'Pelaksanaan Audit', 'name' => 'Fieldwork Cash Opname'],
            ['level' => 'Pelaksanaan Audit', 'name' => 'Fieldwork Inquiry'],
            ['level' => 'Pelaksanaan Audit', 'name' => 'Permintaan bukti dukung tambahan ke manajemen'],
            ['level' => 'Pelaksanaan Audit', 'name' => 'Exit Meeting Fieldwork'],
            ['level' => 'Pelaksanaan Audit', 'name' => 'Pengiriman Form B (Hasil audit) ke BPK'],
            ['level' => 'Pelaksanaan Audit', 'name' => 'Informasi Jurnal Penyesuaian ke Klien'],
            
            // Pelaporan Audit
            ['level' => 'Pelaporan Audit', 'name' => 'Pengiriman Form C (peristiwa setelah tanggal pelaporan) ke BPK'],
            ['level' => 'Pelaporan Audit', 'name' => 'Pengiriman draft LK audited ke manajemen'],
            ['level' => 'Pelaporan Audit', 'name' => 'Pengiriman draft laporan kepatuhan perundangan'],
            ['level' => 'Pelaporan Audit', 'name' => 'Pengiriman draft Management Letter'],
            ['level' => 'Pelaporan Audit', 'name' => 'Pengiriman approval for printing draft audited ke manajemen'],
            ['level' => 'Pelaporan Audit', 'name' => 'Pengiriman approval for printing draft laporan kepatuhan perundangan'],
            ['level' => 'Pelaporan Audit', 'name' => 'Pengiriman approval for printing draft Management Letter'],
            ['level' => 'Pelaporan Audit', 'name' => 'Permintaan surat ke manajemen'],
            ['level' => 'Pelaporan Audit', 'name' => 'Pengiriman LK Audited'],
            ['level' => 'Pelaporan Audit', 'name' => 'Pengiriman Final Laporan'],
        ];

        foreach ($subLevelsData as $subLevelData) {
            $level = $levels[$subLevelData['level']] ?? null;
            if ($level) {
                SubLevel::firstOrCreate(
                    [
                        'name' => $subLevelData['name'],
                        'level_id' => $level->id,
                    ],
                    [
                        'slug' => Str::slug($subLevelData['name']),
                    ]
                );
            }
        }
    }
}
