<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Events\NewApprovalNotification;
use App\Models\Task;
use App\Models\User;
use App\Models\ProjectTeam;

echo "Testing WebSocket notification with corrected URL...\n";

// Find a task
$task = Task::with('project')->first();
if (!$task) {
    echo "No tasks found\n";
    exit;
}

echo "Found task: {$task->name} (ID: {$task->id})\n";
echo "Project: {$task->project->name} (ID: {$task->project->id})\n";

// Get team leaders from project teams for this project
$teamLeaders = ProjectTeam::where('project_id', $task->project->id)
    ->where('role', 'team leader')
    ->with('user')
    ->get();
    
$approverIds = $teamLeaders->pluck('user.id')->toArray();

echo "Found " . count($approverIds) . " team leaders for this project\n";
foreach ($teamLeaders as $teamLeader) {
    echo "- {$teamLeader->user->name} (ID: {$teamLeader->user->id})\n";
}

if (count($approverIds) > 0) {
    // Fire the event
    event(new NewApprovalNotification($task, $approverIds, 'Test notification with corrected URL - should go to ApprovalDetail page!'));
    echo "\n✅ Notification sent! Check browser for new notification.\n";
    echo "✅ Expected URL: /company/tasks/{$task->id}/approval-detail\n";
    echo "✅ This should now navigate directly to the ApprovalDetail page!\n";
    echo "✅ Auto-marking should work when viewing this page!\n";
} else {
    echo "❌ No team leaders found for this project.\n";
}
