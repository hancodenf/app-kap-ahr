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
                'Kontrak/Perikatan Audit',
                'Surat Tugas',
                'Surat PIC BPK',
                'Schedule Audit',
            ],
            'Perencanaan' => [
                'Permintaan Data',
                'Pembuatan KKP Perencanaan Audit atas Auditee',
                'Pembuatan Pertanyaan Inquiry ke Manajemen oleh Masing-masing PIC Berdasarkan Data Tahun Lalu (ML) dan Sekarang (Laporan Keuangan)',
                'Pengiriman Form A (Penilaian Risiko) ke BPK',
                'Pemenuhan Surat Representasi Awal',
            ],
            'Pelaksanaan Audit' => [
                'Schedule Fieldwork',
                'Fieldwork Stock Opname',
                'Fieldwork Aset Opname',
                'Fieldwork Cash Opname',
                'Fieldwork Inquiry',
                'Vouching',
                'Permintaan Bukti Pendukung Tambahan',
                'Exit Meeting Fieldwork',
                'Pengiriman Form B (Hasil Audit) ke BPK',
                'Informasi Jurnal Penyesuaian ke Klien',
            ],
            'Pelaporan Audit' => [
                'Pengiriman Form C',
                'Pengiriman Draft LK Audited ke Klien',
                'Pengiriman Draft Laporan Kepatuhan Perundangan',
                'Pengiriman Draft Management Letter',
                'Pengiriman Approval for Printing Draft Audited ke Manajemen',
                'Pengiriman Approval for Printing Draft Laporan Kepatuhan Perundangan',
                'Pengiriman Approval for Printing Draft Management Letter',
                'Permintaan Surat ke Manajemen',
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
