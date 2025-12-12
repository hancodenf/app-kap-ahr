<?php

require_once __DIR__ . '/vendor/autoload.php';

use App\Events\NewWorkerTaskNotification;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\DB;

// Bootstrap the Laravel application
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

function testWorkerNotification() {
    echo "🧪 Testing Worker Task Notification System...\n\n";

    // Find a task that has workers assigned
    $taskWithWorkers = DB::table('tasks')
        ->join('task_workers', 'tasks.id', '=', 'task_workers.task_id')
        ->join('project_teams', 'task_workers.project_team_id', '=', 'project_teams.id')
        ->join('projects', 'tasks.project_id', '=', 'projects.id')
        ->select('tasks.*', 'projects.name as project_name', 'projects.id as project_id', 
                 DB::raw('GROUP_CONCAT(project_teams.user_name) as worker_names'), 
                 DB::raw('GROUP_CONCAT(project_teams.user_id) as worker_ids'))
        ->where('tasks.completion_status', '!=', 'completed')
        ->groupBy('tasks.id', 'projects.id', 'projects.name')
        ->first();

    if (!$taskWithWorkers) {
        echo "❌ No tasks found with assigned workers. Cannot test worker notification.\n";
        return;
    }

    // Get task and project objects
    $task = DB::table('tasks')->where('id', $taskWithWorkers->id)->first();
    $project = DB::table('projects')->where('id', $taskWithWorkers->project_id)->first();
    $workerIds = explode(',', $taskWithWorkers->worker_ids);

    echo "📋 Found test task:\n";
    echo "   ID: {$taskWithWorkers->id}\n";
    echo "   Name: {$taskWithWorkers->name}\n";
    echo "   Project: {$taskWithWorkers->project_name}\n";
    echo "   Workers: {$taskWithWorkers->worker_names}\n";
    echo "   Worker IDs: {$taskWithWorkers->worker_ids}\n\n";

    // Test different action types (both client and company actions)
    $actionTypes = ['client_approved', 'client_uploaded', 'client_replied', 'client_returned', 'company_approved', 'company_rejected', 'task_completed'];

    foreach ($actionTypes as $actionType) {
        echo "🚀 Testing action type: {$actionType}\n";

        try {
            // Create and broadcast the notification
            $event = new NewWorkerTaskNotification(
                $task,
                $project,
                $workerIds,
                $actionType
            );

            // Count notifications before
            $beforeCount = DB::table('notifications')->where('type', 'worker_task')->count();

            // Manually trigger database save by dispatching the event
            event($event);
            
            // Count notifications after
            $afterCount = DB::table('notifications')->where('type', 'worker_task')->count();
            $newNotifications = $afterCount - $beforeCount;

            echo "   ✅ Created {$newNotifications} notification(s) in database\n";

            // Show latest notification details
            $latestNotification = DB::table('notifications')
                ->where('type', 'worker_task')
                ->where('data', 'like', "%{$actionType}%")
                ->orderBy('created_at', 'desc')
                ->first();

            if ($latestNotification) {
                echo "   📄 Latest notification:\n";
                echo "      User ID: {$latestNotification->user_id}\n";
                echo "      Title: {$latestNotification->title}\n";
                echo "      Message: {$latestNotification->message}\n";
                echo "      Action Type: {$actionType}\n";
            }

            // Try to broadcast (this will only work if Reverb server is running)
            try {
                broadcast($event);
                echo "   📡 WebSocket broadcast attempted\n";
            } catch (Exception $e) {
                echo "   ⚠️ WebSocket broadcast failed (Reverb server might not be running): " . $e->getMessage() . "\n";
            }

        } catch (Exception $e) {
            echo "   ❌ Failed: " . $e->getMessage() . "\n";
        }

        echo "\n";
    }

    // Summary
    echo "📊 SUMMARY:\n";
    echo "Worker notification system test completed!\n\n";

    // Show total worker task notifications
    $totalWorkerNotifications = DB::table('notifications')->where('type', 'worker_task')->count();
    echo "Total worker task notifications in database: {$totalWorkerNotifications}\n";

    // Show workers who would receive notifications
    $workers = DB::table('project_teams')->whereIn('user_id', $workerIds)->get();
    
    echo "\n👥 Workers who would receive these notifications:\n";
    foreach ($workers as $worker) {
        $workerNotificationCount = DB::table('notifications')
            ->where('type', 'worker_task')
            ->where('user_id', $worker->user_id)
            ->count();
        echo "   - {$worker->user_name} (ID: {$worker->user_id}) - {$workerNotificationCount} notifications\n";
    }

    echo "\n🎯 To test live WebSocket delivery:\n";
    echo "1. Start Laravel Reverb server: php artisan reverb:start\n";
    echo "2. Login as one of the workers above\n";
    echo "3. Ensure WebSocket notifications component is loaded\n";
    echo "4. Trigger client actions (approve/upload/reply/return) to see real-time notifications\n\n";
}

testWorkerNotification();
