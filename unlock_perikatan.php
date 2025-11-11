<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== UNLOCKING STEP PERIKATAN ===\n\n";

$project = App\Models\Project::where('name', 'LIKE', '%UIN Alauddin Makassar%')->first();

if (!$project) {
    echo "Project not found!\n";
    exit;
}

$perikatanStep = App\Models\WorkingStep::where('project_id', $project->id)
    ->where('name', 'Perikatan')
    ->first();

if (!$perikatanStep) {
    echo "Step 'Perikatan' not found!\n";
    exit;
}

echo "Found step: {$perikatanStep->name}\n";
echo "Current status: " . ($perikatanStep->is_locked ? 'LOCKED ❌' : 'UNLOCKED ✅') . "\n\n";

if ($perikatanStep->is_locked) {
    echo "Unlocking step...\n";
    $perikatanStep->update(['is_locked' => false]);
    echo "✅ Step 'Perikatan' has been UNLOCKED!\n\n";
    
    echo "Now client Muhammad Rizki can access tasks:\n";
    $tasks = App\Models\Task::where('working_step_id', $perikatanStep->id)
        ->where('client_interact', true)
        ->get();
    
    foreach ($tasks as $task) {
        echo "  - Task #{$task->id}: {$task->name}\n";
    }
    
    echo "\n✅ Client can now see the upload button!\n";
} else {
    echo "Step is already unlocked!\n";
}
