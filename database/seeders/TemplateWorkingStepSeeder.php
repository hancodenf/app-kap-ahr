<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\TemplateWorkingStep;
use Illuminate\Support\Str;

class TemplateWorkingStepSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        // Get the first project template (Project Audit BLU)
        $projectTemplate = \App\Models\ProjectTemplate::where('name', 'Project Audit BLU')->first();
        
        if (!$projectTemplate) {
            $this->command->info('No project template found. Skipping TemplateWorkingStepSeeder.');
            return;
        }

        $steps = [
            ['name' => 'Perikatan', 'order' => 1],
            ['name' => 'Perencanaan Audit', 'order' => 2],
            ['name' => 'Pelaksanaan Audit', 'order' => 3], 
            ['name' => 'Pelaporan', 'order' => 4],
            ['name' => 'Tindak Lanjut', 'order' => 5]
        ];

        foreach ($steps as $index => $step) {
            TemplateWorkingStep::create([
                'name' => $step['name'],
                'slug' => Str::slug($step['name']),
                'project_template_id' => $projectTemplate->id,
                'order' => $step['order']
            ]);
        }
    }
}
