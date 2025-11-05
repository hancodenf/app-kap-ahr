<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Admin user
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'position' => 'System Administrator',
        ]);

        // Company users
        User::create([
            'name' => 'John Partner',
            'email' => 'partner@company.com',
            'password' => Hash::make('password'),
            'role' => 'company',
            'position' => 'Partner',
        ]);

        User::create([
            'name' => 'Jane Manager',
            'email' => 'manager@company.com',
            'password' => Hash::make('password'),
            'role' => 'company',
            'position' => 'Manager',
        ]);

        User::create([
            'name' => 'Bob Supervisor',
            'email' => 'supervisor@company.com',
            'password' => Hash::make('password'),
            'role' => 'company',
            'position' => 'Supervisor',
        ]);

        User::create([
            'name' => 'Alice Team Leader',
            'email' => 'teamleader@company.com',
            'password' => Hash::make('password'),
            'role' => 'company',
            'position' => 'Team Leader',
        ]);

        User::create([
            'name' => 'Mike Auditor',
            'email' => 'auditor@company.com',
            'password' => Hash::make('password'),
            'role' => 'company',
            'position' => 'Senior Auditor',
        ]);

        // Client user
        User::create([
            'name' => 'Client Representative',
            'email' => 'client@client.com',
            'password' => Hash::make('password'),
            'role' => 'client',
            'position' => 'Finance Manager',
        ]);
    }
}
