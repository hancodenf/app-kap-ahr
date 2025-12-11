<?php

require 'vendor/autoload.php';

use App\Events\NewApprovalNotification;
use App\Models\Task;
use App\Models\User;

// Simulate a test notification
$task = Task::with('project')->first();
$teamLeader = User::whereHas('projectTeam', function($query) {
    $query->where('role', 'team leader');
})->first();

if ($task && $teamLeader) {
    echo "Dispatching test NewApprovalNotification...\n";
    echo "Task: {$task->name}\n";
    echo "Team Leader: {$teamLeader->name} (ID: {$teamLeader->id})\n";
    echo "Project: {$task->project->name} (ID: {$task->project->id})\n";
    
    event(new NewApprovalNotification(
        $task,
        [$teamLeader->id],
        "Test notification from console"
    ));
    
    echo "Event dispatched!\n";
} else {
    echo "No task or team leader found for testing\n";
}
