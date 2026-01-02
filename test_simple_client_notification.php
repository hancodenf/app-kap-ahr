<?php

require_once __DIR__ . '/vendor/autoload.php';

use App\Models\Task;
use App\Models\Project;
use App\Models\User;
use App\Events\NewClientTaskNotification;

echo "🧪 Simple Client Notification Test...\n";

// Bootstrap Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

try {
    // Get any project and task
    $project = Project::first();
    $task = Task::first();
    
    // Get a client user
    $clientUser = User::where('role', 'client')->first();
    
    if (!$project || !$task || !$clientUser) {
        echo "❌ Missing data - project: " . ($project ? '✅' : '❌') . 
             ", task: " . ($task ? '✅' : '❌') . 
             ", client: " . ($clientUser ? '✅' : '❌') . "\n";
        exit(1);
    }
    
    echo "📋 Test Data:\n";
    echo "  - Project: {$project->name}\n";
    echo "  - Task: {$task->name}\n";
    echo "  - Client: {$clientUser->name} ({$clientUser->email})\n";
    
    $clientUserIds = [$clientUser->id];
    
    echo "\n🔔 Sending Client Notifications...\n";
    
    // Test 1: Task Completed
    echo "\n1️⃣ Sending Task Completed Notification...\n";
    $completedMessage = "Task '{$task->name}' in your project '{$project->name}' has been completed successfully! 🎉";
    
    event(new NewClientTaskNotification(
        $task, 
        $project,
        $clientUserIds, 
        $completedMessage
    ));
    
    echo "   ✅ SENT to client: {$clientUser->email}\n";
    echo "   📧 Message: {$completedMessage}\n";
    
    sleep(3);
    
    // Test 2: Action Required
    echo "\n2️⃣ Sending Action Required Notification...\n";
    $actionMessage = "Task '{$task->name}' in your project '{$project->name}' needs your attention - please upload requested documents 📋";
    
    event(new NewClientTaskNotification(
        $task, 
        $project,
        $clientUserIds, 
        $actionMessage
    ));
    
    echo "   ✅ SENT to client: {$clientUser->email}\n";
    echo "   📧 Message: {$actionMessage}\n";
    
    echo "\n🎯 Test Complete!\n";
    echo "📱 Client should now see notifications in their dashboard\n";
    echo "🔔 Check browser notifications (if permission granted)\n";
    echo "💾 Check database notifications table\n";
    
    echo "\n📋 Next Steps:\n";
    echo "1. Login as client: {$clientUser->email}\n";
    echo "2. Go to Client Dashboard\n";
    echo "3. Check notification bell icon 🔔\n";
    echo "4. Should see 2 new notifications\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
    exit(1);
}
