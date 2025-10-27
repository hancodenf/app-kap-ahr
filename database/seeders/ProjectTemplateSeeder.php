<?php

namespace Database\Seeders;

use App\Models\ProjectTemplate;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProjectTemplateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create project template categories
        $templates = [
            'Project Audit BLU',
            'Audit Internal KAP',
            'Review Pengendalian Internal',
            'Audit Keuangan Tahunan',
            'Audit Operasional',
        ];

        foreach ($templates as $templateName) {
            ProjectTemplate::create([
                'name' => $templateName,
            ]);
        }
    }
}
