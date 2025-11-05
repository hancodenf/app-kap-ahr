<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ClientSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $clientUser = User::where('role', 'client')->first();

        if ($clientUser) {
            Client::create([
                'user_id' => $clientUser->id,
                'name' => 'PT Telekomunikasi Indonesia',
                'alamat' => 'Jl. Japati No. 1, Bandung 40133',
                'kementrian' => 'Kementerian BUMN',
                'kode_satker' => '012345',
            ]);
        }

        // Create additional clients for testing
        $additionalUsers = User::factory()->count(3)->create([
            'role' => 'client',
            'position' => null,  // Client role should have null position
            'user_type' => null, // Client role should have null user_type
        ]);

        $clientData = [
            [
                'name' => 'PT Bank Negara Indonesia',
                'alamat' => 'Jl. Jenderal Sudirman Kav. 1, Jakarta 10220',
                'kementrian' => 'Kementerian BUMN',
                'kode_satker' => '012346',
            ],
            [
                'name' => 'PT Pertamina (Persero)',
                'alamat' => 'Jl. Medan Merdeka Timur 1A, Jakarta 10110',
                'kementrian' => 'Kementerian BUMN',
                'kode_satker' => '012347',
            ],
            [
                'name' => 'Kementerian Keuangan RI',
                'alamat' => 'Jl. Lapangan Banteng Timur 2-4, Jakarta 10710',
                'kementrian' => 'Kementerian Keuangan',
                'kode_satker' => '012348',
            ],
        ];

        foreach ($additionalUsers as $index => $user) {
            Client::create([
                'user_id' => $user->id,
                'name' => $clientData[$index]['name'],
                'alamat' => $clientData[$index]['alamat'],
                'kementrian' => $clientData[$index]['kementrian'],
                'kode_satker' => $clientData[$index]['kode_satker'],
            ]);
        }
    }
}
