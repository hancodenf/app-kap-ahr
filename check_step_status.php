<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== CHECKING WORKING STEPS FOR PROJECT UIN ALAUDDIN MAKASSAR ===\n\n";

$project = App\Models\Project::where('name', 'LIKE', '%UIN Alauddin Makassar%')->first();

if (!$project) {
    echo "Project not found!\n";
    exit;
}

echo "Project: {$project->name}\n";
echo "Status: {$project->status}\n\n";

$steps = App\Models\WorkingStep::where('project_id', $project->id)
    ->orderBy('order')
    ->get();

foreach ($steps as $step) {
    echo "Step {$step->order}: {$step->name}\n";
    echo "  Locked: " . ($step->is_locked ? 'YES ❌' : 'NO ✅') . "\n";
    
    // Get tasks for this step
    $tasks = App\Models\Task::where('working_step_id', $step->id)->get();
    echo "  Total tasks: {$tasks->count()}\n";
    
    if ($tasks->count() > 0) {
        $requiredTasks = $tasks->where('is_required', true);
        echo "  Required tasks: {$requiredTasks->count()}\n";
        
        if ($requiredTasks->count() > 0) {
            $completedRequired = $requiredTasks->where('completion_status', 'completed')->count();
            echo "  Completed required: {$completedRequired}/{$requiredTasks->count()}\n";
            
            foreach ($requiredTasks as $task) {
                echo "    - Task #{$task->id}: {$task->name}\n";
                echo "      Status: {$task->completion_status}\n";
                echo "      Client Interact: " . $task->client_interact . "\n";
            }
        }
    }
    
    echo "\n";
}

echo "\n=== ANALYSIS ===\n\n";

// Check why step Perikatan might be locked
$perikatanStep = $steps->where('name', 'Perikatan')->first();
if ($perikatanStep) {
    echo "Step 'Perikatan' is currently: " . ($perikatanStep->is_locked ? 'LOCKED ❌' : 'UNLOCKED ✅') . "\n";
    
    if ($perikatanStep->is_locked) {
        echo "\nWhy is it locked?\n";
        echo "- Step 'Perikatan' is order {$perikatanStep->order}\n";
        
        if ($perikatanStep->order > 1) {
            $previousStep = $steps->where('order', $perikatanStep->order - 1)->first();
            if ($previousStep) {
                echo "- Previous step: {$previousStep->name}\n";
                
                $prevRequiredTasks = App\Models\Task::where('working_step_id', $previousStep->id)
                    ->where('is_required', true)
                    ->get();
                
                if ($prevRequiredTasks->count() > 0) {
                    $prevCompleted = $prevRequiredTasks->where('completion_status', 'completed')->count();
                    echo "- Previous step has {$prevRequiredTasks->count()} required tasks\n";
                    echo "- Only {$prevCompleted} are completed\n";
                    echo "- Need to complete ALL required tasks in '{$previousStep->name}' to unlock 'Perikatan'\n";
                } else {
                    echo "- Previous step has NO required tasks\n";
                    echo "- Step 'Perikatan' should be unlocked automatically!\n";
                    echo "- MANUAL UNLOCK NEEDED!\n";
                }
            }
        } else {
            echo "- This is the FIRST step! It should NEVER be locked!\n";
            echo "- MANUAL UNLOCK NEEDED!\n";
        }
    }
}
