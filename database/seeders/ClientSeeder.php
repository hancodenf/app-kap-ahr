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
                    'name' => 'Ahmad Fauzi',
                    'email' => 'ahmad.fauzi@uinmataram.ac.id',
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
                    'name' => 'Siti Rahma',
                    'email' => 'siti.rahma@uinib.ac.id',
                ]
            ],
            [
                'client' => [
                    'name' => 'PT Pertamina (Persero)',
                    'slug' => Str::slug('PT Pertamina (Persero)'),
                    'alamat' => 'Jl. Medan Merdeka Timur 1A, Jakarta 10110',
                    'kementrian' => 'Kementerian BUMN',
                    'name' => 'UIN Mahmud Yunus Batusangkar',
                    'alamat' => 'Jl. Sudirman No. 137, Batusangkar, Sumatera Barat',
                    'kementrian' => 'Kementerian Agama',
                    'kode_satker' => '012347',
                ],
                'user' => [
                    'name' => 'Budi Santoso',
                    'email' => 'budi.santoso@uinmybatusangkar.ac.id',
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
                    'email' => 'dewi.kusuma@uingusdur.ac.id',
                ]
            ],
            [
                'client' => [
                    'name' => 'UIN Alauddin Makassar',
                    'alamat' => 'Jl. Sultan Alauddin No. 63, Makassar, Sulawesi Selatan',
                    'kementrian' => 'Kementerian Agama',
                    'kode_satker' => '012349',
                ],
                'user' => [
                    'name' => 'Muhammad Rizki',
                    'email' => 'muhammad.rizki@uin-alauddin.ac.id',
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
