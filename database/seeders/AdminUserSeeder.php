<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $adminRole = Role::where('name', 'admin')->first();
        $partnerRole = Role::where('name', 'partner')->first();
        $staffRole = Role::where('name', 'staff')->first();
        $klienRole = Role::where('name', 'klien')->first();

        // Create admin user
        User::firstOrCreate(['email' => 'admin@example.com'], [
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'role_id' => $adminRole->id,
        ]);

        // Create partner user
        User::firstOrCreate(['email' => 'partner@example.com'], [
            'name' => 'Partner User',
            'email' => 'partner@example.com',
            'password' => Hash::make('password'),
            'role_id' => $partnerRole->id,
        ]);

        // Create staff user
        User::firstOrCreate(['email' => 'staff@example.com'], [
            'name' => 'Staff User',
            'email' => 'staff@example.com',
            'password' => Hash::make('password'),
            'role_id' => $staffRole->id,
        ]);

        // Create klien user
        User::firstOrCreate(['email' => 'klien@example.com'], [
            'name' => 'Klien User',
            'email' => 'klien@example.com',
            'password' => Hash::make('password'),
            'role_id' => $klienRole->id,
        ]);
    }
}
