<?php

use App\Events\NewApprovalNotification;
use Illuminate\Support\Facades\Artisan;

// Test manual broadcast
$fakeTask = (object)[
    'id' => 'test-123',
    'name' => 'Test Task Manual',
    'project' => (object)[
        'id' => '019b0afd-bde8-72f1-9c62-e8457dbd42dd',
        'name' => 'Test Project'
    ]
];

$userId = '019b0afd-6547-7013-91f5-0807fb43b319'; // Fachriza

echo "Dispatching manual test event...\n";
echo "User ID: {$userId}\n";
echo "Task: {$fakeTask->name}\n";
echo "Project ID: {$fakeTask->project->id}\n";

event(new NewApprovalNotification(
    $fakeTask,
    [$userId],
    "MANUAL TEST - This is a test notification"
));

echo "Manual test event dispatched!\n";
