<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== CHECKING USER ACCESS TO TASKS ===\n\n";

// Get all users and their accessible tasks
$users = App\Models\User::where('role', 'client')->get();

foreach ($users as $user) {
    echo "User: {$user->name} ({$user->email})\n";
    echo "Client ID: {$user->client_id}\n";
    
    // Get client
    $client = App\Models\Client::find($user->client_id);
    if ($client) {
        echo "Client Name: {$client->name}\n";
        
        // Get projects for this client
        $projects = App\Models\Project::where('client_id', $client->id)->get();
        echo "Total Projects: {$projects->count()}\n";
        
        foreach ($projects as $project) {
            echo "\n  Project: {$project->name}\n";
            echo "  Status: {$project->status}\n";
            
            // Get tasks with client_interact for this project
            $tasks = App\Models\Task::where('project_id', $project->id)
                ->where('client_interact', '!=', 'read only')
                ->get();
            
            echo "  Tasks with client_interact enabled: {$tasks->count()}\n";
            
            if ($tasks->count() > 0) {
                foreach ($tasks as $task) {
                    echo "    - Task ID {$task->id}: {$task->name}\n";
                    echo "      Status: {$task->status}\n";
                    
                    // Get working step
                    $step = App\Models\WorkingStep::find($task->working_step_id);
                    if ($step) {
                        echo "      Working Step: {$step->name}\n";
                        echo "      Step Locked: " . ($step->is_locked ? 'YES' : 'NO') . "\n";
                    }
                }
            }
        }
    }
    
    echo "\n" . str_repeat("=", 80) . "\n\n";
}
