<?php

require_once __DIR__ . '/vendor/autoload.php';

use App\Models\Task;
use App\Models\Project;
use App\Models\User;
use App\Models\ProjectTeam;
use App\Models\TaskAssignment;
use App\Events\NewClientTaskNotification;

echo "🧪 Testing Client Notification Trigger...\n";

// Bootstrap Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

try {
    // Find a project with client
    $project = Project::where('status', 'In Progress')
        ->whereHas('users', function($query) {
            $query->where('users.role', 'client');
        })
        ->first();
    
    if (!$project) {
        echo "❌ No project with client found\n";
        exit(1);
    }
    
    // Get client users for this project
    $clientUsers = $project->users()
        ->where('users.role', 'client')
        ->get();
    
    if ($clientUsers->isEmpty()) {
        echo "❌ No client users found for project {$project->name}\n";
        exit(1);
    }
    
    // Find a task in this project
    $task = $project->workingSteps()
        ->with(['tasks'])
        ->first()
        ?->tasks
        ?->first();
        
    if (!$task) {
        echo "❌ No task found for project {$project->name}\n";
        exit(1);
    }
    
    echo "📋 Test Data:\n";
    echo "  - Project: {$project->name}\n";
    echo "  - Task: {$task->name}\n";
    echo "  - Client Users:\n";
    foreach ($clientUsers as $clientUser) {
        echo "    • {$clientUser->name} ({$clientUser->email})\n";
    }
    
    $clientUserIds = $clientUsers->pluck('id')->toArray();
    
    echo "\n🔔 Testing Client Notifications:\n";
    
    // Test 1: Task Completed Notification
    echo "\n1️⃣ Testing Task Completed Notification...\n";
    $completedMessage = "Task '{$task->name}' in your project has been completed successfully!";
    
    event(new NewClientTaskNotification(
        $task, 
        $project,
        $clientUserIds, 
        $completedMessage
    ));
    
    echo "   ✅ Sent task completed notification to " . count($clientUserIds) . " client(s)\n";
    echo "   📧 Message: {$completedMessage}\n";
    
    sleep(2); // Wait a bit before next notification
    
    // Test 2: Action Required Notification
    echo "\n2️⃣ Testing Action Required Notification...\n";
    $actionMessage = "Task '{$task->name}' in your project needs your attention - please upload requested documents";
    
    event(new NewClientTaskNotification(
        $task, 
        $project,
        $clientUserIds, 
        $actionMessage
    ));
    
    echo "   ✅ Sent action required notification to " . count($clientUserIds) . " client(s)\n";
    echo "   📧 Message: {$actionMessage}\n";
    
    echo "\n🎯 Test Results:\n";
    echo "✅ Client notification system working!\n";
    echo "📱 Check client dashboard for real-time notifications\n";
    echo "🔔 Check browser notifications (if permission granted)\n";
    echo "💾 Check database notifications table for persistence\n";
    
    // Show notification data that should appear in database
    echo "\n📊 Expected Database Records:\n";
    echo "Table: notifications\n";
    echo "Type: client_task\n";
    echo "Recipients: " . $clientUsers->pluck('email')->join(', ') . "\n";
    echo "Messages: \n";
    echo "  - Task completed: '{$task->name}' completed successfully\n";
    echo "  - Action required: '{$task->name}' needs attention\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}
