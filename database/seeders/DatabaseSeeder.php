<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            // First create users and clients
            UserSeeder::class,
            ClientSeeder::class,
            
            // // Create project templates
            ProjectTemplateSeeder::class,
            
            // // Create template working steps and tasks (needs project templates)
            TemplateWorkingStepSeeder::class,
            TemplateTaskSeeder::class,
            
            // // Create projects (needs clients)
            ProjectSeeder::class,
            
            // // Create working steps and tasks (needs projects for denormalized data)
            WorkingStepSeeder::class,
            TaskSeeder::class,
            
            // // Create task workers (needs tasks and project teams)
            // // TaskWorkerSeeder::class,
            
            // // Other seeders
            RegisteredApSeeder::class,
            NewsSeeder::class,
        ]);

        // Clean up existing storage directories before creating new ones
        $this->command->info('Cleaning up existing storage directories...');
        $clientsPath = storage_path('app/public/clients');
        if (file_exists($clientsPath)) {
            \Illuminate\Support\Facades\File::deleteDirectory($clientsPath);
            $this->command->info('Existing clients directory removed.');
        }

        // After all seeders completed, create storage directories
        $this->command->info('Creating storage directories...');
        \Illuminate\Support\Facades\Artisan::call('storage:create-directories');
        $this->command->info('Storage directories created successfully!');
        
        // Set proper ownership for storage directories
        $this->command->info('Setting directory ownership to www-data...');
        exec('sudo chown -R www:www storage 2>&1', $output, $returnCode);
        exec('sudo chown -R www:www storage 2>&1', $output, $returnCode);
        if ($returnCode === 0) {
            $this->command->info('Ownership set successfully!');
        } else {
            $this->command->warn('Could not set ownership (requires sudo). Run manually: sudo chown -R www-data:www-data storage/app/');
        }
    }
}
