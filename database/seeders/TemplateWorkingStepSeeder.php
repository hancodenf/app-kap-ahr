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
        $steps = [
            ['name' => 'Perikatan', 'project_template_id' => 1, 'order' => 1],
            ['name' => 'Perencanaan Audit', 'project_template_id' => 1, 'order' => 2],
            ['name' => 'Pelaksanaan Audit', 'project_template_id' => 1, 'order' => 3], 
            ['name' => 'Pelaporan', 'project_template_id' => 1, 'order' => 4],
            ['name' => 'Tindak Lanjut', 'project_template_id' => 1, 'order' => 5]
        ];

        foreach ($steps as $index => $step) {
            TemplateWorkingStep::create([
                'name' => $step['name'],
                'slug' => Str::slug($step['name']),
                'project_template_id' => $step['project_template_id'],
                'order' => $step['order']
            ]);
        }
    }
}
