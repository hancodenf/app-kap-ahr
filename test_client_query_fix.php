<?php

require_once __DIR__ . '/vendor/autoload.php';

use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\DB;

// Bootstrap the Laravel application
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

function testClientNotificationQuery() {
    echo "🧪 Testing Client Notification Query Fix...\n\n";

    // Find a project to test
    $project = DB::table('projects')->first();
    
    if (!$project) {
        echo "❌ No projects found for testing.\n";
        return;
    }
    
    echo "📋 Testing with project:\n";
    echo "   ID: {$project->id}\n";
    echo "   Name: {$project->name}\n\n";
    
    try {
        // Try to replicate the problematic query
        echo "🔍 Testing client users query...\n";
        
        // Get project model instance
        $projectModel = \App\Models\Project::find($project->id);
        
        if (!$projectModel) {
            echo "❌ Project model not found.\n";
            return;
        }
        
        // This should work now with the fix
        $clientUserIds = $projectModel->users()
            ->where('users.role', 'client')  // Fixed with table prefix
            ->pluck('users.id')
            ->toArray();
            
        echo "✅ Method 1 query executed successfully!\n";
        echo "📊 Found " . count($clientUserIds) . " client users for this project (Method 1)\n";
        
        if (!empty($clientUserIds)) {
            echo "👥 Client user IDs: " . implode(', ', $clientUserIds) . "\n";
        }
        
        // Test Method 3 (the problematic one with whereHas)
        echo "\n🔍 Testing Method 3 (whereHas) query...\n";
        $clientUserIds3 = \App\Models\User::where('role', 'client')
            ->whereHas('projects', function($query) use ($projectModel) {
                $query->where('projects.id', $projectModel->id);  // Fixed with table prefix
            })
            ->pluck('id')
            ->toArray();
            
        echo "✅ Method 3 query executed successfully!\n";
        echo "📊 Found " . count($clientUserIds3) . " client users for this project (Method 3)\n";
        
        if (!empty($clientUserIds3)) {
            echo "👥 Client user IDs (Method 3): " . implode(', ', $clientUserIds3) . "\n";
        }
        
    } catch (Exception $e) {
        echo "❌ Query failed: " . $e->getMessage() . "\n";
        echo "🔍 Error type: " . get_class($e) . "\n";
        
        // Check if it's still the ambiguous column error
        if (strpos($e->getMessage(), 'Column \'role\' in where clause is ambiguous') !== false) {
            echo "⚠️ Still has ambiguous column error! Need to fix more places.\n";
        }
    }
    
    echo "\n🎯 SUMMARY:\n";
    echo "If this test passes, the approval error should be fixed.\n";
    echo "The query now properly specifies 'users.role' to avoid ambiguity.\n";
}

testClientNotificationQuery();
