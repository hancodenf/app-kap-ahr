<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== UNLOCKING ALL STEPS ===\n\n";

$steps = App\Models\WorkingStep::all();

echo "Total steps found: {$steps->count()}\n\n";

foreach ($steps as $step) {
    if ($step->is_locked) {
        $step->update(['is_locked' => false]);
        echo "✅ Unlocked: {$step->name} (Project: {$step->project_name})\n";
    } else {
        echo "Already unlocked: {$step->name} (Project: {$step->project_name})\n";
    }
}

echo "\n✅ All steps are now unlocked!\n";
echo "\nNote: Client access is now controlled ONLY by 'client_interact' flag on tasks.\n";
