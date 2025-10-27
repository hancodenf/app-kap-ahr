<?php

namespace Database\Seeders;

use App\Models\RegisteredAp;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class RegisteredApSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get company users to assign AP registration
        $companyUsers = User::where('role', 'company')->get();

        $apData = [
            [
                'ap_number' => 'AP-001-2024',
                'registration_date' => Carbon::parse('2024-01-15'),
                'expiry_date' => Carbon::parse('2027-01-15'),
                'status' => 'active',
            ],
            [
                'ap_number' => 'AP-002-2024',
                'registration_date' => Carbon::parse('2024-02-20'),
                'expiry_date' => Carbon::parse('2027-02-20'),
                'status' => 'active',
            ],
            [
                'ap_number' => 'AP-003-2024',
                'registration_date' => Carbon::parse('2024-03-10'),
                'expiry_date' => Carbon::parse('2027-03-10'),
                'status' => 'active',
            ],
            [
                'ap_number' => 'AP-004-2024',
                'registration_date' => Carbon::parse('2024-04-05'),
                'expiry_date' => Carbon::parse('2027-04-05'),
                'status' => 'active',
            ],
            [
                'ap_number' => 'AP-005-2024',
                'registration_date' => Carbon::parse('2024-05-12'),
                'expiry_date' => Carbon::parse('2027-05-12'),
                'status' => 'active',
            ],
        ];

        foreach ($companyUsers->take(5) as $index => $user) {
            if (isset($apData[$index])) {
                RegisteredAp::create([
                    'user_id' => $user->id,
                    'ap_number' => $apData[$index]['ap_number'],
                    'registration_date' => $apData[$index]['registration_date'],
                    'expiry_date' => $apData[$index]['expiry_date'],
                    'status' => $apData[$index]['status'],
                ]);
            }
        }
    }
}
