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
            
            // Create project templates
            ProjectTemplateSeeder::class,
            
            // Create template working steps and tasks (needs project templates)
            TemplateWorkingStepSeeder::class,
            TemplateTaskSeeder::class,
            
            // Create projects (needs clients)
            ProjectSeeder::class,
            
            // Create working steps and tasks (needs projects for denormalized data)
            WorkingStepSeeder::class,
            TaskSeeder::class,
            
            // Create task workers (needs tasks and project teams)
            // TaskWorkerSeeder::class,
            
            // Other seeders
            RegisteredApSeeder::class,
            NewsSeeder::class,
        ]);
    }
}
