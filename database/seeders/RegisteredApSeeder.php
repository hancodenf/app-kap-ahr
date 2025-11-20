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
        // Get users by email to get their UUID
        $abdulHamid = User::where('email', 'abdulhamid@kap-ahr.com')->first();
        $wildaFarah = User::where('email', 'wilda_farah@kap-ahr.com')->first();
        $syamsulBahri = User::where('email', 'syamsulbahri@kap-ahr.com')->first();

        // Skip if users don't exist
        if (!$abdulHamid || !$wildaFarah || !$syamsulBahri) {
            $this->command->warn('Some users not found. Skipping AP registration seeder.');
            return;
        }

        $apData = [];

        $apData[] = [
            'ap_number' => 'AP. 0818',
            'user_id' => $abdulHamid->id,
            'registration_date' => Carbon::parse('2021-11-12'),
            'expiry_date' => Carbon::parse('2026-11-12'),
            'status' => 'active',
        ];

        $apData[] = [
            'ap_number' => 'AP.1271',
            'user_id' => $wildaFarah->id,
            'registration_date' => Carbon::parse('2021-07-21'),
            'expiry_date' => Carbon::parse('2026-07-21'),
            'status' => 'active',
        ];
        
        $apData[] = [
            'ap_number' => 'AP.1760',
            'user_id' => $syamsulBahri->id,
            'registration_date' => Carbon::parse('2021-07-14'),
            'expiry_date' => Carbon::parse('2026-07-14'),
            'status' => 'active',
        ];
        
        foreach ($apData as $data) {
            RegisteredAp::create([
                'user_id' => $data['user_id'],
                'ap_number' => $data['ap_number'],
                'registration_date' => $data['registration_date'],
                'expiry_date' => $data['expiry_date'],
                'status' => $data['status'],
            ]);
        }
    }
}
