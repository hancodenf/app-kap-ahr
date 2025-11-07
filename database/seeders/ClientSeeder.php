<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ClientSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Data clients dengan user yang akan dibuat
        $clientsData = [
            [
                'client' => [
                    'name' => 'PT Telekomunikasi Indonesia',
                    'slug' => Str::slug('PT Telekomunikasi Indonesia'),
                    'alamat' => 'Jl. Japati No. 1, Bandung 40133',
                    'kementrian' => 'Kementerian BUMN',
                    'kode_satker' => '012345',
                ],
                'user' => [
                    'name' => 'Budi Santoso',
                    'email' => 'budi.santoso@telkom.co.id',
                ]
            ],
            [
                'client' => [
                    'name' => 'PT Bank Negara Indonesia',
                    'slug' => Str::slug('PT Bank Negara Indonesia'),
                    'alamat' => 'Jl. Jenderal Sudirman Kav. 1, Jakarta 10220',
                    'kementrian' => 'Kementerian BUMN',
                    'kode_satker' => '012346',
                ],
                'user' => [
                    'name' => 'Siti Nurhaliza',
                    'email' => 'siti.nurhaliza@bni.co.id',
                ]
            ],
            [
                'client' => [
                    'name' => 'PT Pertamina (Persero)',
                    'slug' => Str::slug('PT Pertamina (Persero)'),
                    'alamat' => 'Jl. Medan Merdeka Timur 1A, Jakarta 10110',
                    'kementrian' => 'Kementerian BUMN',
                    'kode_satker' => '012347',
                ],
                'user' => [
                    'name' => 'Ahmad Wijaya',
                    'email' => 'ahmad.wijaya@pertamina.com',
                ]
            ],
            [
                'client' => [
                    'name' => 'Kementerian Keuangan RI',
                    'slug' => Str::slug('Kementerian Keuangan RI'),
                    'alamat' => 'Jl. Lapangan Banteng Timur 2-4, Jakarta 10710',
                    'kementrian' => 'Kementerian Keuangan',
                    'kode_satker' => '012348',
                ],
                'user' => [
                    'name' => 'Dewi Kusuma',
                    'email' => 'dewi.kusuma@kemenkeu.go.id',
                ]
            ],
        ];

        // Create clients dan users
        foreach ($clientsData as $data) {
            // Buat client dulu
            $client = Client::create($data['client']);

            // Buat user untuk client ini
            User::create([
                'name' => $data['user']['name'],
                'email' => $data['user']['email'],
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'role' => 'client',
                'client_id' => $client->id, // Link ke client yang baru dibuat
                'position' => null,
                'user_type' => null,
            ]);
        }
    }
}
