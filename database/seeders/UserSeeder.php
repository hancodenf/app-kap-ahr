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
        // Admin user - position null, user_type = 'Staff' (auto)
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
            'role' => 'admin',
            'position' => null,
            'user_type' => 'Staff',
        ]);

        // Company users from provided data
        $companyUsers = [
            ["name" => "Abdul Hamid", "position" => "Founder - Partner", "user_type" => "Tenaga Ahli"],
            ["name" => "Wilda Farah", "position" => "Managing Partner", "user_type" => "Tenaga Ahli"],
            ["name" => "Syamsul Bahri", "position" => "Partner", "user_type" => "Tenaga Ahli"],
            ["name" => "Fachriza Fayyad Fauzan", "position" => "Associates Manager", "user_type" => "Staff"],
            ["name" => "Tumiran Tawirana", "position" => "Tenaga Ahli - Supervisor", "user_type" => "Tenaga Ahli"],
            ["name" => "Soliyah Wulandari", "position" => "Tenaga Ahli - Supervisor", "user_type" => "Tenaga Ahli"],
            ["name" => "Rezky Mehta Setiadi", "position" => "Tenaga Ahli - Supervisor", "user_type" => "Tenaga Ahli"],
            ["name" => "Suhartono", "position" => "Tenaga Ahli - Supervisor", "user_type" => "Tenaga Ahli"],
            ["name" => "Purwanto", "position" => "Tenaga Ahli - Supervisor", "user_type" => "Tenaga Ahli"],
            ["name" => "Kandidat Supervisor", "position" => "Tenaga Ahli - Supervisor", "user_type" => "Tenaga Ahli"],
            ["name" => "Bayu Dwi Cahyanto", "position" => "Senior Auditor", "user_type" => "Staff"],
            ["name" => "Ananda Mohammad Rizky Setiawan", "position" => "Senior Auditor", "user_type" => "Staff"],
            ["name" => "Khairunnissa", "position" => "Senior Auditor", "user_type" => "Staff"],
            ["name" => "Zuhaira Fadla Fachrina", "position" => "Junior Auditor", "user_type" => "Staff"],
            ["name" => "Muhammad Rifky Effendi", "position" => "Junior Auditor", "user_type" => "Staff"],
            ["name" => "Ria Afrizal", "position" => "Junior Auditor", "user_type" => "Staff"],
            ["name" => "Muhamad Rizky", "position" => "Junior Auditor", "user_type" => "Staff"],
            ["name" => "Raden Panji Rangga Prasetyo", "position" => "Junior Auditor", "user_type" => "Staff"],
            ["name" => "Satrio Bayu Wibowo", "position" => "Internship Auditor", "user_type" => "Staff"],
            ["name" => "Fakhira Rifa Adinda", "position" => "Internship Auditor", "user_type" => "Staff"],
            ["name" => "Muhammad Luthfian", "position" => "Internship Auditor", "user_type" => "Staff"],
            ["name" => "Muhammad Husni Faris Rasyid", "position" => "Internship Auditor", "user_type" => "Staff"],
            ["name" => "Ahmad Reski Tiarah", "position" => "Internship Auditor", "user_type" => "Staff"],
            ["name" => "Fitri Indah Ayuningsih", "position" => "Internship Finance", "user_type" => "Staff"],
            ["name" => "Hartono", "position" => "Support", "user_type" => "Staff"],
            ["name" => "Aas Mawati", "position" => "Internship Finance", "user_type" => "Staff"],
            ["name" => "Hanif Rabbani Harahap", "position" => "Internship HR", "user_type" => "Staff"],
            ["name" => "Rizka Amelia", "position" => "Junior Auditor", "user_type" => "Staff"],
            ["name" => "(Kandidat Junior)", "position" => "Junior Auditor", "user_type" => "Staff"],
        ];

        foreach ($companyUsers as $index => $userData) {
            // Generate email dari nama
            $emailName = strtolower(str_replace(' ', '.', trim($userData['name'])));
            $emailName = preg_replace('/[^a-z0-9.]/', '', $emailName); // Remove special characters
            
            User::create([
                'name' => $userData['name'],
                'email' => $emailName . '@kapahr.com',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'role' => 'company',
                'position' => $userData['position'],
                'user_type' => $userData['user_type'],
            ]);
        }

        // Client users - akan dibuat setelah clients terseeder
        // Akan diassign client_id di ClientSeeder
    }
}
