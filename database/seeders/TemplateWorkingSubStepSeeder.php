<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\TemplateWorkingStep;
use App\Models\TemplateWorkingSubStep;
use Illuminate\Support\Str;

class TemplateWorkingSubStepSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        // Perikatan
        $perikatan = TemplateWorkingStep::where('slug', 'perikatan')->first();
        if ($perikatan) {
            $perikatanSubSteps = [
                'Penetapan KAP',
                'Surat Perikatan',
                'Penerimaan Klien',
                'Evaluasi Kemampuan KAP'
            ];

            foreach ($perikatanSubSteps as $subStep) {
                TemplateWorkingSubStep::create([
                    'name' => $subStep,
                    'slug' => Str::slug($subStep),
                    'template_working_step_id' => $perikatan->id
                ]);
            }
        }

        // Perencanaan Audit
        $perencanaan = TemplateWorkingStep::where('slug', 'perencanaan-audit')->first();
        if ($perencanaan) {
            $perencanaanSubSteps = [
                'Pemahaman Entitas',
                'Penilaian Risiko',
                'Program Audit',
                'Penetapan Materialitas',
                'Strategi Audit'
            ];

            foreach ($perencanaanSubSteps as $subStep) {
                TemplateWorkingSubStep::create([
                    'name' => $subStep,
                    'slug' => Str::slug($subStep),
                    'template_working_step_id' => $perencanaan->id
                ]);
            }
        }

        // Pelaksanaan Audit
        $pelaksanaan = TemplateWorkingStep::where('slug', 'pelaksanaan-audit')->first();
        if ($pelaksanaan) {
            $pelaksanaanSubSteps = [
                'Test of Control',
                'Substantive Test',
                'Analytical Review',
                'Detail Testing',
                'Cut-off Test'
            ];

            foreach ($pelaksanaanSubSteps as $subStep) {
                TemplateWorkingSubStep::create([
                    'name' => $subStep,
                    'slug' => Str::slug($subStep),
                    'template_working_step_id' => $pelaksanaan->id
                ]);
            }
        }

        // Pelaporan
        $pelaporan = TemplateWorkingStep::where('slug', 'pelaporan')->first();
        if ($pelaporan) {
            $pelaporanSubSteps = [
                'Draft Laporan',
                'Review Laporan',
                'Laporan Final',
                'Management Letter'
            ];

            foreach ($pelaporanSubSteps as $subStep) {
                TemplateWorkingSubStep::create([
                    'name' => $subStep,
                    'slug' => Str::slug($subStep),
                    'template_working_step_id' => $pelaporan->id
                ]);
            }
        }

        // Tindak Lanjut
        $tindakLanjut = TemplateWorkingStep::where('slug', 'tindak-lanjut')->first();
        if ($tindakLanjut) {
            $tindakLanjutSubSteps = [
                'Follow Up Temuan',
                'Evaluasi Implementasi',
                'Review Perbaikan'
            ];

            foreach ($tindakLanjutSubSteps as $subStep) {
                TemplateWorkingSubStep::create([
                    'name' => $subStep,
                    'slug' => Str::slug($subStep),
                    'template_working_step_id' => $tindakLanjut->id
                ]);
            }
        }
    }
}
