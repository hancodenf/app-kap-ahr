<?php

namespace Database\Seeders;

use App\Models\WorkingStep;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class WorkingStepSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $workingSteps = [
            'Perikatan',
            'Perencanaan',
            'Pelaksanaan Audit',
            'Pelaporan Audit',
        ];

        // Get first project for seeding data
        $projects = \App\Models\Project::all();
        
        if ($projects->isEmpty()) {
            $this->command->info('No projects found. Skipping WorkingStepSeeder.');
            return;
        }

        foreach ($projects as $project) {
            foreach ($workingSteps as $index => $step) {
                WorkingStep::create([
                    'order' => $index + 1,
                    'project_id' => $project->id,
                    'name' => $step,
                    'slug' => Str::slug($step . '-' . $project->id), // Make unique per project
                    // Denormalized project data
                    'project_name' => $project->name,
                    'project_client_name' => $project->client_name,
                ]);
            }
        }
    }
}
