<?php

namespace Database\Seeders;

use App\Models\SubStepWorker;
use App\Models\WorkingSubStep;
use App\Models\ProjectTeam;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SubStepWorkerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get existing working sub steps and project teams
        $workingSubSteps = WorkingSubStep::all();
        $projectTeams = ProjectTeam::all();

        if ($workingSubSteps->isNotEmpty() && $projectTeams->isNotEmpty()) {
            // Create some sample sub step workers
            foreach ($workingSubSteps->take(5) as $subStep) {
                // Assign 1-3 team members to each sub step
                $assignedTeams = $projectTeams->random(rand(1, min(3, $projectTeams->count())));
                
                foreach ($assignedTeams as $team) {
                    SubStepWorker::create([
                        'working_sub_step_id' => $subStep->id,
                        'project_team_id' => $team->id,
                        // Denormalized working sub step data
                        'working_sub_step_name' => $subStep->name,
                        'working_step_name' => $subStep->working_step_name,
                        'project_name' => $subStep->project_name,
                        'project_client_name' => $subStep->project_client_name,
                        // Denormalized project team data
                        'worker_name' => $team->user_name,
                        'worker_email' => $team->user_email,
                        'worker_role' => $team->role,
                    ]);
                }
            }
        }
    }
}
