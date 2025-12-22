<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

// Test script to check template copy functionality
echo "=== Testing Template Copy Functionality ===\n\n";

// Get all templates
$templates = \App\Models\ProjectTemplate::all();
echo "Total templates: " . $templates->count() . "\n\n";

foreach ($templates as $template) {
    echo "Template: {$template->name} (ID: {$template->id})\n";
    
    // Get template steps
    $templateSteps = \App\Models\TemplateWorkingStep::where('project_template_id', $template->id)
        ->with('templateTasks')
        ->orderBy('order')
        ->get();
    
    echo "  - Template steps: " . $templateSteps->count() . "\n";
    
    foreach ($templateSteps as $step) {
        echo "    * Step: {$step->name} (Order: {$step->order})\n";
        echo "      - Tasks: " . $step->templateTasks->count() . "\n";
        
        foreach ($step->templateTasks as $task) {
            echo "        + Task: {$task->name}\n";
            if ($task->approval_roles) {
                echo "          Approval roles: " . implode(', ', $task->approval_roles) . "\n";
            }
        }
    }
    echo "\n";
}

// Test the comparison that was wrong
echo "\n=== Testing String Comparison ===\n";
$testUuid = '019b4418-fb5c-7276-be05-b35621b78be3';
echo "UUID: {$testUuid}\n";
echo "UUID > 0: " . ($testUuid > 0 ? 'true' : 'false') . " (WRONG!)\n";
echo "UUID !== '0': " . ($testUuid !== '0' ? 'true' : 'false') . " (CORRECT!)\n";
echo "'0' !== '0': " . ('0' !== '0' ? 'true' : 'false') . " (should be false)\n";
