<?php

namespace Database\Seeders;

use App\Models\TaskWorker;
use App\Models\Task;
use App\Models\ProjectTeam;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TaskWorkerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get existing tasks and project teams
        $tasks = Task::all();
        $projectTeams = ProjectTeam::all();

        if ($tasks->isNotEmpty() && $projectTeams->isNotEmpty()) {
            // Create some sample task workers
            foreach ($tasks->take(5) as $task) {
                // Assign 1-3 team members to each task
                $assignedTeams = $projectTeams->random(rand(1, min(3, $projectTeams->count())));
                
                foreach ($assignedTeams as $team) {
                    TaskWorker::create([
                        'task_id' => $task->id,
                        'project_team_id' => $team->id,
                        // Denormalized task data;d,;w,d;wd
                        'task_name' => $task->name,
                        'working_step_name' => $task->working_step_name,
                        'project_name' => $task->project_name,
                        'project_client_name' => $task->project_client_name,    
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
