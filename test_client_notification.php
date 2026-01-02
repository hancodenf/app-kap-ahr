<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Events\NewClientTaskNotification;
use App\Models\Task;
use App\Models\Project;
use App\Models\User;

echo "Testing Client WebSocket notification system...\n";

// Find a project and create a test client user if needed
$project = Project::first();
if (!$project) {
    echo "❌ No projects found\n";
    exit;
}

echo "Found project: {$project->name} (ID: {$project->id})\n";

// Check for client users
$clientUsers = User::where('role', 'client')->get();
if ($clientUsers->isEmpty()) {
    echo "🔧 No client users found, creating test client user...\n";
    
    // Create test client user
    $clientUser = User::create([
        'name' => 'Test Client User',
        'email' => 'client@test.com',
        'password' => bcrypt('password'),
        'role' => 'client',
        'position' => 'Client Representative'
    ]);
    
    echo "✅ Created test client user: {$clientUser->name} (ID: {$clientUser->id})\n";
    $clientUserIds = [$clientUser->id];
} else {
    echo "Found " . $clientUsers->count() . " client users:\n";
    foreach ($clientUsers as $client) {
        echo "- {$client->name} (ID: {$client->id}, Email: {$client->email})\n";
    }
    $clientUserIds = $clientUsers->pluck('id')->toArray();
}

// Find a task with "Submitted to Client" status or create test scenario
$task = Task::whereHas('taskAssignments', function($query) {
    $query->where('status', 'Submitted to Client');
})->with('project')->first();

if (!$task) {
    echo "🔧 No tasks with 'Submitted to Client' status found, using first task for testing...\n";
    $task = Task::with('project')->first();
    
    if (!$task) {
        echo "❌ No tasks found at all\n";
        exit;
    }
}

echo "Using task: {$task->name} (ID: {$task->id})\n";
echo "Task project: {$task->project->name} (ID: {$task->project->id})\n";

// Fire client task notification event
echo "\n🚀 Firing client task notification event...\n";

event(new NewClientTaskNotification(
    $task, 
    $task->project,
    $clientUserIds, 
    "Test notification: Task '{$task->name}' has been submitted for your review in project '{$task->project->name}'"
));

echo "\n✅ Client notification sent!\n";
echo "📋 Notification details:\n";
echo "  - Task: {$task->name} (ID: {$task->id})\n";
echo "  - Project: {$task->project->name} (ID: {$task->project->id})\n";
echo "  - Recipients: " . count($clientUserIds) . " client users\n";
echo "  - Expected URL: /client/projects/{$task->project->id}/tasks/{$task->id}\n";
echo "\n🔍 Check:\n";
echo "  1. Browser console for WebSocket message (if client logged in)\n";
echo "  2. Database notifications table for new records\n";
echo "  3. Client notification bell icon for new notification\n";
echo "  4. Toast notification in client interface\n";
echo "\n🧪 You can test by:\n";

$testEmail = !$clientUsers->isEmpty() ? $clientUsers->first()->email : 'client@test.com';
echo "  1. Login as client user: {$testEmail}\n";
echo "  2. Watch for real-time notification\n";
echo "  3. Click bell icon to see notification dropdown\n";
echo "  4. Click notification to navigate to task detail\n";
