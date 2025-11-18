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
        // Get users by position for AP registration
        $partner = User::where('role', 'company')
            ->where('position', 'Partner')
            ->first();
        $manager = User::where('role', 'company')
            ->where('position', 'Associates Manager')
            ->first();
        $supervisor = User::where('role', 'company')
            ->where('position', 'Tenaga Ahli - Supervisor')
            ->first();

        $apData = [];
        
        if ($partner) {
            $apData[] = [
                'ap_number' => 'AP. 0818',
                'user_id' => $partner->id,
                'registration_date' => Carbon::parse('2021-11-12'),
                'expiry_date' => Carbon::parse('2026-11-12'),
                'status' => 'active',
            ];
        }
        
        if ($manager) {
            $apData[] = [
                'ap_number' => 'AP.1271',
                'user_id' => $manager->id,
                'registration_date' => Carbon::parse('2021-07-21'),
                'expiry_date' => Carbon::parse('2026-07-21'),
                'status' => 'active',
            ];
        }
        
        if ($supervisor) {
            $apData[] = [
                'ap_number' => 'AP.1760',
                'user_id' => $supervisor->id,
                'registration_date' => Carbon::parse('2021-07-14'),
                'expiry_date' => Carbon::parse('2026-07-14'),
                'status' => 'active',
            ];
        }
        
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
