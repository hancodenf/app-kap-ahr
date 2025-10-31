<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\TemplateWorkingStep;
use App\Models\TemplateTask;
use Illuminate\Support\Str;

class TemplateTaskSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        // Perikatan
        $perikatan = TemplateWorkingStep::where('slug', 'perikatan')->first();
        if ($perikatan) {
            $perikatanTasks = [
                'Penetapan KAP',
                'Surat Perikatan',
                'Penerimaan Klien',
                'Evaluasi Kemampuan KAP'
            ];

            foreach ($perikatanTasks as $task) {
                TemplateTask::create([
                    'name' => $task,
                    'slug' => Str::slug($task),
                    'template_working_step_id' => $perikatan->id
                ]);
            }
        }

        // Perencanaan Audit
        $perencanaan = TemplateWorkingStep::where('slug', 'perencanaan-audit')->first();
        if ($perencanaan) {
            $perencanaanTasks = [
                'Pemahaman Entitas',
                'Penilaian Risiko',
                'Program Audit',
                'Penetapan Materialitas',
                'Strategi Audit'
            ];

            foreach ($perencanaanTasks as $task) {
                TemplateTask::create([
                    'name' => $task,
                    'slug' => Str::slug($task),
                    'template_working_step_id' => $perencanaan->id
                ]);
            }
        }

        // Pelaksanaan Audit
        $pelaksanaan = TemplateWorkingStep::where('slug', 'pelaksanaan-audit')->first();
        if ($pelaksanaan) {
            $pelaksanaanTasks = [
                'Test of Control',
                'Substantive Test',
                'Analytical Review',
                'Detail Testing',
                'Cut-off Test'
            ];

            foreach ($pelaksanaanTasks as $task) {
                TemplateTask::create([
                    'name' => $task,
                    'slug' => Str::slug($task),
                    'template_working_step_id' => $pelaksanaan->id
                ]);
            }
        }

        // Pelaporan
        $pelaporan = TemplateWorkingStep::where('slug', 'pelaporan')->first();
        if ($pelaporan) {
            $pelaporanTasks = [
                'Draft Laporan',
                'Review Laporan',
                'Laporan Final',
                'Management Letter'
            ];

            foreach ($pelaporanTasks as $task) {
                TemplateTask::create([
                    'name' => $task,
                    'slug' => Str::slug($task),
                    'template_working_step_id' => $pelaporan->id
                ]);
            }
        }

        // Tindak Lanjut
        $tindakLanjut = TemplateWorkingStep::where('slug', 'tindak-lanjut')->first();
        if ($tindakLanjut) {
            $tindakLanjutTasks = [
                'Follow Up Temuan',
                'Evaluasi Implementasi',
                'Review Perbaikan'
            ];

            foreach ($tindakLanjutTasks as $task) {
                TemplateTask::create([
                    'name' => $task,
                    'slug' => Str::slug($task),
                    'template_working_step_id' => $tindakLanjut->id
                ]);
            }
        }
    }
}
