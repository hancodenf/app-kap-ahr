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
        $adminUser = [
            ["name" => "Aas Mawati", "position" => "Internship Finance", "user_type" => "Staff", "email" => "aas.mawati@kap-ahr.com"],
            ["name" => "Hanif Rabbani Harahap", "position" => "Internship HR", "user_type" => "Staff", "email" => "hanif.rabbani@kap-ahr.com"]
        ];
        
        foreach ($adminUser as $user) {
            User::create([
                'name' => $user['name'],
                'email' => $user['email'],
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'role' => 'admin',
                'position' => $user['position'],
                'user_type' => 'Staff',
            ]);
        }

        // Company users from provided data
        $companyUsers = [   
            ["name" => "Abdul Hamid", "position" => "Founder - Partner", "user_type" => "Staff", "email" => "abdulhamid@kap-ahr.com"],
            ["name" => "Wilda Farah", "position" => "Managing Partner", "user_type" => "Staff", "email" => "wilda_farah@kap-ahr.com"],
            ["name" => "Syamsul Bahri", "position" => "Partner", "user_type" => "Staff", "email" => "syamsulbahri@kap-ahr.com"],
            ["name" => "Fachriza Fayyad Fauzan", "position" => "Associates Manager", "user_type" => "Staff", "email" => "fachriza@kap-ahr.com"],
            ["name" => "Tumiran Tawirana", "position" => "Tenaga Ahli - Supervisor", "user_type" => "Staff", "email" => "tumirantawirana@kap-ahr.com"],
            ["name" => "Soliyah Wulandari", "position" => "Tenaga Ahli - Supervisor", "user_type" => "Staff", "email" => "soliyahwulandari@kap-ahr.com"],
            ["name" => "Rezky Mehta Setiadi", "position" => "Tenaga Ahli - Supervisor", "user_type" => "Staff", "email" => "rezkymehta@kap-ahr.com"],
            ["name" => "Suhartono", "position" => "Tenaga Ahli - Supervisor", "user_type" => "Staff", "email" => "suhartono@kap-ahr.com"],
            ["name" => "Purwanto", "position" => "Tenaga Ahli - Supervisor", "user_type" => "Staff", "email" => "purwanto@kap-ahr.com"],
            
            ["name" => "Bayu Dwi Cahyanto", "position" => "Senior Auditor", "user_type" => "Staff", "email" => "bayu_dwich@kap-ahr.com"],
            ["name" => "Ananda Mohammad Rizky", "position" => "Senior Auditor", "user_type" => "Staff", "email" => "anandamoris@kap-ahr.com"],
            ["name" => "Khairunnissa", "position" => "Senior Auditor", "user_type" => "Staff", "email" => "khairunnissa@kap-ahr.com"],
            ["name" => "Zuhaira Fadla Fachrina", "position" => "Junior Auditor", "user_type" => "Staff", "email" => "zuhairafadla@kap-ahr.com"],
            ["name" => "Muhammad Rifky Effendy", "position" => "Junior Auditor", "user_type" => "Staff", "email" => "rifky@kap-ahr.com"],
            ["name" => "Ria Afrizal", "position" => "Junior Auditor", "user_type" => "Staff", "email" => "ria_afrizal@kap-ahr.com"],
            ["name" => "Muhamad Rizky", "position" => "Junior Auditor", "user_type" => "Staff", "email" => "mhmd.rizk@kap-ahr.com"],
            ["name" => "Raden Panji Rangga Prasetyo", "position" => "Junior Auditor", "user_type" => "Staff", "email" => "rp.rangga@kap-ahr.com"],
            ["name" => "Satrio Bayu Wibowo", "position" => "Internship Auditor", "user_type" => "Staff", "email" => "satriobw@kap-ahr.com"],
            ["name" => "Fakhira Rifa Adinda", "position" => "Internship Auditor", "user_type" => "Staff", "email" => "fakhirarf@kap-ahr.com"],
            ["name" => "Muhammad Luthfian Arif", "position" => "Internship Auditor", "user_type" => "Staff", "email" => "luthfian@kap-ahr.com"],
            ["name" => "Muhammad Husni Faris", "position" => "Internship Auditor", "user_type" => "Staff", "email" => "husnifaris@kap-ahr.com"],
            ["name" => "Ahmad Reski Tiarah", "position" => "Internship Auditor", "user_type" => "Staff", "email" => "ahmadreski@kap-ahr.com"],
            ["name" => "Fitri Indah Ayuningsih", "position" => "Internship Finance", "user_type" => "Staff", "email" => "fitriindah@kap-ahr.com"],
            ["name" => "Hartono", "position" => "Support", "user_type" => "Staff", "email" => "hartono@kap-ahr.com"],
            ["name" => "Rizka Amelia", "position" => "Junior Auditor", "user_type" => "Staff", "email" => "rizkaamelia@kap-ahr.com"], 
            
            // Tenaga Ahli
            ["name" => "Irma Nuranisa", "position" => "Tenaga Ahli - Supervisor", "user_type" => "Tenaga Ahli", "email" => "irmanuranisa@kap-ahr.com"],
            ["name" => "Jeremi Octavianus Iroth", "position" => "Senior Auditor", "user_type" => "Tenaga Ahli", "email" => "jeremi@kap-ahr.com"],
            ["name" => "Audy Alifia Rudy", "position" => "Senior Auditor", "user_type" => "Tenaga Ahli", "email" => "audyrudy@kap-ahr.com"],
            
            // ========== NEWLY ADDED USERS ==========
            ["name" => "Brian Pramudita", "position" => "Tenaga Ahli - Supervisor", "user_type" => "Tenaga Ahli", "email" => "brianpramudita@kap-ahr.com"],
            ["name" => "Resi Ariyasa Qadri", "position" => "Junior Auditor", "user_type" => "Staff", "email" => "resiariyasa@kap-ahr.com"],
            ["name" => "Yusar Sagara", "position" => "Junior Auditor", "user_type" => "Staff", "email" => "yusarsagara@kap-ahr.com"],
            ["name" => "Nur Isnaini", "position" => "Junior Auditor", "user_type" => "Tenaga Ahli", "email" => "nurisnaini@kap-ahr.com"],
            ["name" => "Cavin Valeri Nayotama", "position" => "Internship Auditor", "user_type" => "Tenaga Ahli", "email" => "cavinvaleri@kap-ahr.com"],
            ["name" => "Kievo Syah Guzman", "position" => "Internship Auditor", "user_type" => "Staff", "email" => "kievosyah@kap-ahr.com"],
            ["name" => "Mohammad Ilham Akbar", "position" => "Internship Auditor", "user_type" => "Staff", "email" => "ilhamakbar@kap-ahr.com"],
            ["name" => "Diva Muzdalipah", "position" => "Internship Auditor", "user_type" => "Staff", "email" => "divamuzdalipah@kap-ahr.com"],
            ["name" => "Zulya Fathul Jannah", "position" => "Internship Auditor", "user_type" => "Staff", "email" => "zulyafathul@kap-ahr.com"],
        ];

        foreach ($companyUsers as $index => $userData) {
            User::create([
                'name' => $userData['name'],
                'email' => $userData['email'],
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'role' => 'company',
                'position' => $userData['position'],
                'user_type' => $userData['user_type'],
            ]);
        }

    }
}
