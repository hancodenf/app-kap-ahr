<?php

namespace Database\Seeders;

use App\Models\Document;
use App\Models\Level;
use App\Models\SubLevel;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DocumentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get levels for mapping
        $levels = Level::all()->keyBy('name');

        $documentsData = [
            // Perikatan
            ['level' => 'Perikatan', 'sub_level' => 'Penetapan KAP', 'document' => 'Surat Penetapan KAP yang dipilih'],
            ['level' => 'Perikatan', 'sub_level' => 'Kontrak / Perikatan Audit', 'document' => 'Surat Perikatan KAP'],
            ['level' => 'Perikatan', 'sub_level' => 'Kontrak / Perikatan Audit', 'document' => 'SPK'],
            ['level' => 'Perikatan', 'sub_level' => 'Surat Tugas', 'document' => 'Surat Tugas Perikatan'],
            ['level' => 'Perikatan', 'sub_level' => 'Surat Tugas', 'document' => 'Surat Tugas Pekerjaan Lapangan'],
            ['level' => 'Perikatan', 'sub_level' => 'Surat PIC BPK', 'document' => 'Surat Penunjukkan PIC BPK'],
            ['level' => 'Perikatan', 'sub_level' => 'Schedule Audit', 'document' => 'Pengajuan jadwal perikatan audit'],

            // Perencanaan
            ['level' => 'Perencanaan', 'sub_level' => 'Permintaan data - permanent file', 'document' => 'Form Permintaan Data'],
            ['level' => 'Perencanaan', 'sub_level' => 'Permintaan data - current file', 'document' => 'Form Permintaan Data'],
            ['level' => 'Perencanaan', 'sub_level' => 'Pembuatan KKP Perencanaan Audit atas auditee', 'document' => 'KKP Perencanaan'],
            ['level' => 'Perencanaan', 'sub_level' => 'Pembuatan Pertanyaan Inquiry ke manajemen oleh masing masing PIC berdasarkan data tahun lalu (ML) dan sekarang (Laporan Keuangan)', 'document' => 'BA Inquiry'],
            ['level' => 'Perencanaan', 'sub_level' => 'Pengiriman Form A (Penilaian Risiko) ke BPK', 'document' => 'Form A (Timing untuk upload form A ke BPKnya)'],
            ['level' => 'Perencanaan', 'sub_level' => 'Pemenuhan surat representasi awal', 'document' => 'Surat Representasi Awal'],

            // Pelaksanaan Audit
            ['level' => 'Pelaksanaan Audit', 'sub_level' => 'Fieldwork Stock Opname', 'document' => 'Berita Acara (BA) Stock Opname'],
            ['level' => 'Pelaksanaan Audit', 'sub_level' => 'Fieldwork Aset Opname', 'document' => 'Berita Acara (BA) Aset Opname'],
            ['level' => 'Pelaksanaan Audit', 'sub_level' => 'Fieldwork Cash Opname', 'document' => 'BA Cash Opname'],
            ['level' => 'Pelaksanaan Audit', 'sub_level' => 'Fieldwork Inquiry', 'document' => 'BA Inquiry'],
            ['level' => 'Pelaksanaan Audit', 'sub_level' => 'Permintaan bukti dukung tambahan ke manajemen', 'document' => 'Buat daftar permintaan data tambahan
'],
            ['level' => 'Pelaksanaan Audit', 'sub_level' => 'Exit Meeting Fieldwork', 'document' => 'Daftar Temuan dari Masing-Masing PIC dan PPT Exit Meeting'],
            ['level' => 'Pelaksanaan Audit', 'sub_level' => 'Pengiriman Form B (Hasil audit) ke BPK', 'document' => 'Hasil Temuan di Akun yang Signifikan'],
            ['level' => 'Pelaksanaan Audit', 'sub_level' => 'Informasi Jurnal Penyesuaian ke Klien', 'document' => 'Daftar Adjustment'],

            // Pelaporan Audit
            ['level' => 'Pelaporan Audit', 'sub_level' => 'Pengiriman Form C (peristiwa setelah tanggal pelaporan) ke BPK', 'document' => 'Form C'],
            ['level' => 'Pelaporan Audit', 'sub_level' => 'Pengiriman draft LK audited ke manajemen', 'document' => 'Draft LK Audited'],
            ['level' => 'Pelaporan Audit', 'sub_level' => 'Pengiriman draft laporan kepatuhan perundangan', 'document' => 'Draft Laporan Kepatuhan'],
            ['level' => 'Pelaporan Audit', 'sub_level' => 'Pengiriman draft Management Letter', 'document' => 'Draft Management Letter'],
            ['level' => 'Pelaporan Audit', 'sub_level' => 'Pengiriman approval for printing draft audited ke manajemen', 'document' => 'AFP Draft LK Audited'],
            ['level' => 'Pelaporan Audit', 'sub_level' => 'Pengiriman approval for printing draft laporan kepatuhan perundangan', 'document' => 'AFP Draft Laporan Kepatuhan'],
            ['level' => 'Pelaporan Audit', 'sub_level' => 'Pengiriman approval for printing draft Management Letter', 'document' => 'AFP Draft Management Letter'],
            ['level' => 'Pelaporan Audit', 'sub_level' => 'Permintaan surat ke manajemen', 'document' => 'Surat Pernyataan Manajemen'],
            ['level' => 'Pelaporan Audit', 'sub_level' => 'Permintaan surat ke manajemen', 'document' => 'Surat Representatif'],
            ['level' => 'Pelaporan Audit', 'sub_level' => 'Permintaan surat ke manajemen', 'document' => 'Surat Penyampaian LK ke P2PK'],
            ['level' => 'Pelaporan Audit', 'sub_level' => 'Pengiriman LK Audited', 'document' => 'LK Audited'],
            ['level' => 'Pelaporan Audit', 'sub_level' => 'Pengiriman Final Laporan', 'document' => 'Laporan Kepatuhan'],
            ['level' => 'Pelaporan Audit', 'sub_level' => 'Pengiriman Final Laporan', 'document' => 'Laporan Management Letter'],
        ];

        foreach ($documentsData as $documentData) {
            $level = $levels[$documentData['level']] ?? null;
            if ($level) {
                $subLevel = SubLevel::where('name', $documentData['sub_level'])
                    ->where('level_id', $level->id)
                    ->first();
                if ($subLevel) {
                    $baseSlug = Str::slug($documentData['document']);
                    $slug = $baseSlug;
                    $counter = 1;
                    
                    // Handle duplicate slugs by appending a number
                    while (Document::where('slug', $slug)->exists()) {
                        $slug = $baseSlug . '-' . $counter;
                        $counter++;
                    }
                    
                    Document::firstOrCreate(
                        [
                            'name' => $documentData['document'],
                            'sub_level_id' => $subLevel->id,
                        ],
                        [
                            'slug' => $slug,
                        ]
                    );
                }
            }
        }
    }
}
