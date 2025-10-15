<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Role;

class TestKlienSeeder extends Seeder
{
    public function run()
    {
        $klienRole = Role::where('name', 'klien')->first();
        
        if ($klienRole) {
            User::create([
                'name' => 'Test Klien',
                'email' => 'klien@test.com',
                'password' => bcrypt('password'),
                'role_id' => $klienRole->id,
            ]);
            
            User::create([
                'name' => 'Klien User',
                'email' => 'user@klien.com',
                'password' => bcrypt('password'),
                'role_id' => $klienRole->id,
            ]);
        }
    }
}