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
            ['name' => 'Perikatan', 'bundle_id' => 1],
            ['name' => 'Perencanaan Audit', 'bundle_id' => 1],
            ['name' => 'Pelaksanaan Audit', 'bundle_id' => 1], 
            ['name' => 'Pelaporan', 'bundle_id' => 1],
            ['name' => 'Tindak Lanjut', 'bundle_id' => 1]
        ];

        foreach ($steps as $step) {
            TemplateWorkingStep::create([
                'name' => $step['name'],
                'slug' => Str::slug($step['name']),
                'bundle_id' => $step['bundle_id']
            ]);
        }
    }
}
