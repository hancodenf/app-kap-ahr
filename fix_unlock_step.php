<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== FIXING UNLOCK STEP LOGIC ===\n\n";

// Get the project
$project = App\Models\Project::where('name', 'LIKE', '%Test Project 1%')->first();

if (!$project) {
    echo "Project 'Test Project 1' not found!\n";
    exit;
}

echo "Found project: {$project->name}\n\n";

// Get all steps
$steps = App\Models\WorkingStep::where('project_id', $project->id)
    ->orderBy('order')
    ->get();

foreach ($steps as $step) {
    echo "Step {$step->order}: {$step->name}\n";
    echo "  Currently locked: " . ($step->is_locked ? 'YES ❌' : 'NO ✅') . "\n";
    
    // Get tasks for this step
    $tasks = App\Models\Task::where('working_step_id', $step->id)->get();
    $requiredTasks = $tasks->where('is_required', true);
    $completedRequired = $requiredTasks->where('completion_status', 'completed');
    
    echo "  Required tasks: {$requiredTasks->count()}\n";
    echo "  Completed required: {$completedRequired->count()}\n";
    
    if ($requiredTasks->count() > 0) {
        foreach ($requiredTasks as $task) {
            echo "    - Task #{$task->id}: {$task->name} = {$task->completion_status}\n";
        }
    }
    
    // Check if this step should unlock next step
    if ($requiredTasks->count() > 0 && $requiredTasks->count() === $completedRequired->count()) {
        echo "  ✅ All required tasks completed! Checking next step...\n";
        
        // Trigger unlock logic
        $step->checkAndUnlockNextStep();
        echo "  ✅ Unlock logic triggered!\n";
    }
    
    echo "\n";
}

// Show final status
echo "=== FINAL STATUS ===\n";
foreach ($steps as $step) {
    $step->refresh(); // Reload from database
    echo "Step {$step->order}: {$step->name} = " . ($step->is_locked ? 'LOCKED ❌' : 'UNLOCKED ✅') . "\n";
}

echo "\n✅ Done! Check your browser now.\n";
