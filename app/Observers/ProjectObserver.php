<?php

namespace App\Observers;

use App\Models\Project;
use Illuminate\Support\Facades\File;

class ProjectObserver
{
    /**
     * Handle the Project "created" event.
     */
    public function created(Project $project): void
    {
        // Create directory for this project
        $directory = $project->getFullStoragePath();
        
        if (!File::exists($directory)) {
            File::makeDirectory($directory, 0755, true);
        }
    }

    /**
     * Handle the Project "deleted" event.
     */
    public function deleted(Project $project): void
    {
        // Optionally delete project directory when project is deleted
        // Uncomment if you want to auto-delete directories
        // $directory = $project->getFullStoragePath();
        // 
        // if (File::exists($directory)) {
        //     File::deleteDirectory($directory);
        // }
    }
}
