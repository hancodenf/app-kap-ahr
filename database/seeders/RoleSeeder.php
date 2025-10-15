<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            [
                'name' => 'admin',
                'display_name' => 'Admin',
                'description' => 'Administrator with full access to the system',
            ],
            [
                'name' => 'partner',
                'display_name' => 'Partner',
                'description' => 'Business partner with limited access',
            ],
            [
                'name' => 'staff',
                'display_name' => 'Staff',
                'description' => 'Staff member with operational access',
            ],
            [
                'name' => 'klien',
                'display_name' => 'Klien',
                'description' => 'Client with limited access to their data',
            ],
        ];

        foreach ($roles as $role) {
            Role::firstOrCreate(['name' => $role['name']], $role);
        }
    }
}
