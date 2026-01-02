<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use App\Models\Client;
use App\Models\Project;
use App\Models\Task;

class CreateStorageDirectories extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'storage:create-directories';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create storage directories for existing clients, projects, and tasks';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Creating storage directories...');

        // Create client directories
        $this->info('Creating client directories...');
        $clientCount = 0;
        foreach (Client::whereNotNull('slug')->get() as $client) {
            $path = $client->getFullStoragePath();
            if (!File::exists($path)) {
                File::makeDirectory($path, 0755, true);
                $clientCount++;
            }
        }
        $this->info("Created {$clientCount} client directories.");

        // Create project directories
        $this->info('Creating project directories...');
        $projectCount = 0;
        foreach (Project::whereNotNull('slug')->get() as $project) {
            $path = $project->getFullStoragePath();
            if (!File::exists($path)) {
                File::makeDirectory($path, 0755, true);
                $projectCount++;
            }
        }
        $this->info("Created {$projectCount} project directories.");

        // Create task directories
        $this->info('Creating task directories...');
        $taskCount = 0;
        foreach (Task::whereNotNull('slug')->get() as $task) {
            $path = $task->getFullStoragePath();
            if (!File::exists($path)) {
                File::makeDirectory($path, 0755, true);
                $taskCount++;
            }
        }
        $this->info("Created {$taskCount} task directories.");

        $this->info('Done! Storage directories created successfully.');
        
        return Command::SUCCESS;
    }
}
