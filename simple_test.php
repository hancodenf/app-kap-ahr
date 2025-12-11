<?php

// Simple test script
echo "Current working directory: " . getcwd() . "\n";
echo "Does bootstrap exist: " . (file_exists('bootstrap/app.php') ? 'YES' : 'NO') . "\n";

if (!file_exists('bootstrap/app.php')) {
    echo "❌ Not in Laravel root directory!\n";
    exit(1);
}

require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Http\Kernel::class);

echo "✅ Bootstrap loaded\n";

// Get a task
echo "Finding task...\n";
$task = \App\Models\Task::where('name', 'Penetapan KAP')->first();

if (!$task) {
    echo "❌ Task not found!\n";
    exit(1);
}

echo "✅ Task found: " . $task->name . "\n";
echo "Task ID: " . $task->id . "\n";

// Get approver user IDs (should be array)
$approvers = ['019b0afd-6547-7013-91f5-0807fb43b319']; // Hardcode team leader ID

echo "Creating event...\n";

try {
    $event = new \App\Events\NewApprovalNotification($task, $approvers);
    echo "✅ Event created successfully\n";
    
    echo "Broadcasting...\n";
    broadcast($event);
    echo "✅ Broadcast sent!\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}
