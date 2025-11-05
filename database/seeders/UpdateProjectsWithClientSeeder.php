<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\Project;
use App\Models\ProjectTeam;
use App\Models\WorkingStep;
use App\Models\Task;
use Illuminate\Database\Seeder;

class UpdateProjectsWithClientSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get first available client as default
        $defaultClient = Client::with('user')->first();

        if (!$defaultClient) {
            $this->command->error('No clients found! Please create clients first.');
            return;
        }

        // Get all projects without client_id
        $projectsWithoutClient = Project::whereNull('client_id')->get();

        if ($projectsWithoutClient->isEmpty()) {
            $this->command->info('All projects already have clients assigned.');
            return;
        }

        $this->command->info("Found {$projectsWithoutClient->count()} projects without clients.");
        $this->command->info("Assigning default client: {$defaultClient->name}");

        foreach ($projectsWithoutClient as $project) {
            // Update project with client data
            $project->update([
                'client_id' => $defaultClient->id,
                'client_name' => $defaultClient->name,
                'client_alamat' => $defaultClient->alamat,
                'client_kementrian' => $defaultClient->kementrian,
                'client_kode_satker' => $defaultClient->kode_satker,
            ]);

            // Update denormalized client data in project_teams
            ProjectTeam::where('project_id', $project->id)->update([
                'project_client_name' => $defaultClient->name,
            ]);

            // Update denormalized client data in working_steps
            WorkingStep::where('project_id', $project->id)->update([
                'project_client_name' => $defaultClient->name,
            ]);

            // Update denormalized client data in tasks
            Task::where('project_id', $project->id)->update([
                'project_client_name' => $defaultClient->name,
            ]);

            $this->command->info("✓ Updated project: {$project->name}");
        }

        $this->command->info("\n✅ Successfully updated {$projectsWithoutClient->count()} projects with client data!");
    }
}
