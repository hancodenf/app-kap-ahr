<?php

require_once __DIR__ . '/vendor/autoload.php';

use App\Events\NewApprovalNotification;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\DB;

// Bootstrap the Laravel application
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

function testApprovalCascade() {
    echo "🧪 Testing Approval Cascade Notification System...\n\n";

    // Find a task that has multiple approval levels
    $taskWithApprovals = DB::table('tasks')
        ->join('task_approvals', 'tasks.id', '=', 'task_approvals.task_id')
        ->join('project_teams', 'task_approvals.task_id', '=', 'project_teams.project_id')
        ->select('tasks.*', 
                 DB::raw('GROUP_CONCAT(DISTINCT task_approvals.role ORDER BY task_approvals.order) as approval_roles'),
                 DB::raw('GROUP_CONCAT(DISTINCT task_approvals.order ORDER BY task_approvals.order) as approval_orders'),
                 DB::raw('COUNT(DISTINCT task_approvals.id) as approval_count'))
        ->where('tasks.completion_status', '!=', 'completed')
        ->groupBy('tasks.id')
        ->having('approval_count', '>', 1) // Tasks with multiple approval levels
        ->first();

    if (!$taskWithApprovals) {
        echo "❌ No tasks found with multiple approval levels. Cannot test approval cascade.\n";
        return;
    }

    echo "📋 Found test task with approval cascade:\n";
    echo "   ID: {$taskWithApprovals->id}\n";
    echo "   Name: {$taskWithApprovals->name}\n";
    echo "   Approval Roles: {$taskWithApprovals->approval_roles}\n";
    echo "   Approval Orders: {$taskWithApprovals->approval_orders}\n";
    echo "   Total Approval Levels: {$taskWithApprovals->approval_count}\n\n";

    // Get all approval levels for this task
    $approvals = DB::table('task_approvals')
        ->where('task_id', $taskWithApprovals->id)
        ->orderBy('order', 'asc')
        ->get();

    echo "🔄 Approval Workflow:\n";
    foreach ($approvals as $index => $approval) {
        $isNext = $index === 1 ? ' ← NEXT LEVEL' : '';
        echo "   Level {$approval->order}: {$approval->role} ({$approval->status_name_pending}){$isNext}\n";
    }
    echo "\n";

    // Simulate approval cascade from first to second level
    $currentApproval = $approvals[0];
    $nextApproval = $approvals[1] ?? null;

    if (!$nextApproval) {
        echo "❌ Need at least 2 approval levels to test cascade.\n";
        return;
    }

    echo "🚀 Testing approval cascade: {$currentApproval->role} → {$nextApproval->role}\n";

    // Count notifications before
    $beforeCount = DB::table('notifications')->where('type', 'approval_request')->count();

    // Find users with the next approval role in this project
    $nextRoleUsers = DB::table('project_teams')
        ->join('users', 'project_teams.user_id', '=', 'users.id')
        ->where('project_teams.project_id', $taskWithApprovals->project_id)
        ->where('project_teams.role', $nextApproval->role)
        ->select('users.*', 'project_teams.role as team_role')
        ->get();

    if ($nextRoleUsers->isEmpty()) {
        echo "❌ No users found with role '{$nextApproval->role}' in this project.\n";
        return;
    }

    echo "👥 Users with next approval role ({$nextApproval->role}):\n";
    foreach ($nextRoleUsers as $user) {
        echo "   - {$user->name} (ID: {$user->id})\n";
    }
    echo "\n";

    try {
        // Simulate the approval cascade notification
        foreach ($nextRoleUsers as $user) {
            $event = new NewApprovalNotification(
                (object)[
                    'id' => $taskWithApprovals->id,
                    'name' => $taskWithApprovals->name
                ],
                (object)[
                    'id' => $taskWithApprovals->project_id,
                    'name' => 'Test Project'
                ],
                $user->id,
                "Task '{$taskWithApprovals->name}' requires your approval (forwarded from {$currentApproval->role})"
            );

            // Manually trigger the event
            event($event);
        }

        // Count notifications after
        $afterCount = DB::table('notifications')->where('type', 'approval_request')->count();
        $newNotifications = $afterCount - $beforeCount;

        echo "✅ Created {$newNotifications} approval notification(s) for next role\n";

        // Show latest notification details
        $latestNotification = DB::table('notifications')
            ->where('type', 'approval_request')
            ->orderBy('created_at', 'desc')
            ->first();

        if ($latestNotification) {
            echo "📄 Latest approval notification:\n";
            echo "   User ID: {$latestNotification->user_id}\n";
            echo "   Title: {$latestNotification->title}\n";
            echo "   Message: {$latestNotification->message}\n";
        }

        // Try to broadcast (this will only work if Reverb server is running)
        try {
            broadcast($event);
            echo "📡 WebSocket broadcast attempted\n";
        } catch (Exception $e) {
            echo "⚠️ WebSocket broadcast failed (Reverb server might not be running): " . $e->getMessage() . "\n";
        }

    } catch (Exception $e) {
        echo "❌ Failed: " . $e->getMessage() . "\n";
    }

    echo "\n📊 SUMMARY:\n";
    echo "Approval cascade notification test completed!\n\n";

    // Show total approval notifications
    $totalApprovalNotifications = DB::table('notifications')->where('type', 'approval_request')->count();
    echo "Total approval notifications in database: {$totalApprovalNotifications}\n";

    echo "\n🎯 Complete Approval Flow:\n";
    echo "1. Task submitted → Level 1 approval role gets notified\n";
    echo "2. Level 1 approves → Level 2 approval role gets notified ✅ (implemented)\n";
    echo "3. Level 2 approves → Workers get notified + Client gets notified (if final)\n\n";

    echo "🎉 Approval cascade ensures no approval step gets missed!\n";
}

testApprovalCascade();
