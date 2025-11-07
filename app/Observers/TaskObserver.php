<?php

namespace App\Observers;

use App\Models\Task;
use Illuminate\Support\Facades\File;

class TaskObserver
{
    /**
     * Handle the Task "created" event.
     */
    public function created(Task $task): void
    {
        // Create directory for this task
        $directory = $task->getFullStoragePath();
        
        if (!File::exists($directory)) {
            File::makeDirectory($directory, 0755, true);
        }
    }

    /**
     * Handle the Task "deleted" event.
     */
    public function deleted(Task $task): void
    {
        // Optionally delete task directory when task is deleted
        // Uncomment if you want to auto-delete directories
        // $directory = $task->getFullStoragePath();
        // 
        // if (File::exists($directory)) {
        //     File::deleteDirectory($directory);
        // }
    }
}
