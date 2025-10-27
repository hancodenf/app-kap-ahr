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
            
            // Create projects (needs clients)
            ProjectSeeder::class,
            
            // Create working steps and sub steps (needs projects for denormalized data)
            WorkingStepSeeder::class,
            WorkingSubStepSeeder::class,
            
            // Create sub step workers (needs working sub steps and project teams)
            SubStepWorkerSeeder::class,
            
            // Other seeders
            RegisteredApSeeder::class,
        ]);
    }
}
