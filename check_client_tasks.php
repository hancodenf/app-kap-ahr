<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== CHECKING CLIENT INTERACT TASKS ===\n\n";

// Get tasks with client_interact enabled
$tasks = App\Models\Task::where('client_interact', true)->get();

echo "Total tasks with client_interact=true: " . $tasks->count() . "\n\n";

if ($tasks->count() > 0) {
    foreach ($tasks as $task) {
        echo "Task ID: " . $task->id . "\n";
        echo "Task Name: " . $task->name . "\n";
        echo "Client Interact: " . ($task->client_interact ? 'TRUE' : 'FALSE') . "\n";
        echo "Multiple Files: " . ($task->multiple_files ? 'TRUE' : 'FALSE') . "\n";
        echo "Status: " . $task->status . "\n";
        echo "Working Step: " . $task->working_step_name . "\n";
        echo "Project: " . $task->project_name . "\n";
        echo "---\n";
    }
} else {
    echo "NO TASKS FOUND with client_interact=true!\n";
    echo "\nThis is why the upload button doesn't appear!\n";
    echo "You need to enable 'Client Interact' checkbox in Admin Panel for tasks.\n";
}

echo "\n=== CHECKING USER LOGIN ===\n\n";

// Check if there's a client user
$clientUsers = App\Models\User::where('role', 'client')->get();
echo "Total client users: " . $clientUsers->count() . "\n\n";

if ($clientUsers->count() > 0) {
    foreach ($clientUsers as $user) {
        echo "User ID: " . $user->id . "\n";
        echo "Name: " . $user->name . "\n";
        echo "Email: " . $user->email . "\n";
        echo "Role: " . $user->role . "\n";
        echo "Client ID: " . ($user->client_id ?? 'NULL') . "\n";
        echo "---\n";
    }
}

echo "\n=== CHECKING PROJECTS ===\n\n";

$projects = App\Models\Project::with('workingSteps.tasks')->get();
echo "Total projects: " . $projects->count() . "\n\n";

foreach ($projects as $project) {
    echo "Project: " . $project->name . "\n";
    echo "Client: " . $project->client_name . "\n";
    echo "Status: " . $project->status . "\n";
    
    $clientInteractTasks = 0;
    foreach ($project->workingSteps as $step) {
        foreach ($step->tasks as $task) {
            if ($task->client_interact) {
                $clientInteractTasks++;
            }
        }
    }
    
    echo "Tasks with client_interact: " . $clientInteractTasks . "\n";
    echo "---\n";
}
