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
        // Get users by email since we're using UUIDs now
        $user1 = User::where('email', 'aas.mawati@kap-ahr.com')->first();
        $user2 = User::where('email', 'hanif.rabbani.harahap@kap-ahr.com')->first();
        $user3 = User::where('email', 'abdul.hamid.cebba@kap-ahr.com')->first();

        $apData = [
            [
                'ap_number' => 'AP. 0818',
                'user_id' => $user1?->id,
                'registration_date' => Carbon::parse('2021-11-12'),
                'expiry_date' => Carbon::parse('2026-11-12'),
                'status' => 'active',
            ],
            [
                'ap_number' => 'AP.1271',
                'user_id' => $user2?->id,
                'registration_date' => Carbon::parse('2021-07-21'),
                'expiry_date' => Carbon::parse('2026-07-21'),
                'status' => 'active',
            ],
            [
                'ap_number' => 'AP.1760',
                'user_id' => $user3?->id,
                'registration_date' => Carbon::parse('2021-07-14'),
                'expiry_date' => Carbon::parse('2026-07-14'),
                'status' => 'active',
            ], 
        ];
         foreach ($apData as $index => $data) {
                if ($data['user_id']) {
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
}
