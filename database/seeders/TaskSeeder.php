<?php

namespace Database\Seeders;

use App\Models\WorkingStep;
use App\Models\Task;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class TaskSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tasks = [
            'Perikatan' => [
                'Penetapan KAP',
                'Kontrak / Perikatan Audit',
                'Surat Tugas',
                'Surat PIC BPK',
                'Schedule Audit',
            ],
            'Perencanaan' => [
                'Permintaan data',
                'Pembuatan KKP Perencanaan Audit atas auditee',
                'Pembuatan Pertanyaan Inquiry ke manajemen oleh masing masing PIC berdasarkan data tahun lalu (ML) dan sekarang (Laporan Keuangan)',
                'Pengiriman Form A (Penilaian Risiko) ke BPK',
                'Pemenuhan surat representasi awal',
            ],
            'Pelaksanaan Audit' => [
                'schedule fieldwork',
                'Fieldwork Stock Opname',
                'Fieldwork Aset Opname',
                'Fieldwork Cash Opname',
                'Fieldwork Inquiry',
                'Vouching',
                'Permintaan bukti pendukung tambahan',
                'Exit Meeting Fieldwork',
                'Pengiriman Form B (Hasil audit) ke BPK',
                'Informasi Jurnal Penyesuaian ke Klien',
            ],
            'Pelaporan Audit' => [
                'Pengiriman Form C',
                'pengiriman draft LK audited ke Client',
                'pengiriman draft laporan kepatuhan perundangan',
                'pengiriman draft Management Letter',
                'pengiriman approval for printing draft audited ke manajemen',
                'pengiriman approval for printing draft laporan kepatuhan perundangan',
                'pengiriman approval for printing draft Management Letter',
                'permintaan surat ke manajemen',
                'Pengiriman LK Audited',
                'Pengiriman Final Laporan',
            ],
        ];

        foreach ($tasks as $stepName => $taskList) {
            $workingSteps = WorkingStep::where('name', $stepName)->get();
            
            foreach ($workingSteps as $workingStep) {
                foreach ($taskList as $index => $taskName) {
                    Task::create([
                        'order' => $index + 1,
                        'name' => $taskName,
                        'slug' => Str::slug($taskName . '-' . $workingStep->id), // Make unique per working step
                        'project_id' => $workingStep->project_id,
                        'working_step_id' => $workingStep->id,
                        // Denormalized project data
                        'project_name' => $workingStep->project_name,
                        'project_client_name' => $workingStep->project_client_name,
                        // Denormalized working step data
                        'working_step_name' => $workingStep->name,
                    ]);
                }
            }
        }
    }
}
