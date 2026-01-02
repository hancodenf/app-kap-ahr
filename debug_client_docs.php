<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\ClientDocument;
use App\Models\TaskAssignment;

echo "=== CLIENT DOCUMENTS DEBUG ===\n";

echo "\n1. Total ClientDocuments: " . ClientDocument::count() . "\n";

echo "\n2. ClientDocuments without files:\n";
$pendingDocs = ClientDocument::whereNull('file')->limit(5)->get();
foreach ($pendingDocs as $doc) {
    echo "ID: {$doc->id}, Name: {$doc->name}, Assignment: {$doc->task_assignment_id}, File: " . ($doc->file ?? 'NULL') . "\n";
}

echo "\n3. Latest TaskAssignment with ClientDocuments:\n";
$assignment = TaskAssignment::with('clientDocuments')->latest()->first();
if ($assignment) {
    echo "Assignment ID: {$assignment->id}, Status: {$assignment->status}\n";
    echo "ClientDocs count: " . $assignment->clientDocuments->count() . "\n";
    foreach ($assignment->clientDocuments as $doc) {
        echo "  - ID: {$doc->id}, Name: {$doc->name}, File: " . ($doc->file ?? 'NULL') . "\n";
    }
}

echo "\n=== END DEBUG ===\n";
