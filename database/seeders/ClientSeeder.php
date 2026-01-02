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
                    'name' => 'Politeknik Kesehatan Jakarta 1',
                    'slug' => Str::slug('Politeknik Kesehatan Jakarta 1'),
                    'alamat' => 'Jakarta',
                    'kementrian' => 'Kementerian Kesehatan',
                    'kode_satker' => '001001',
                    'type' => 'BLU',
                    'logo' => null,
                ],
                'user' => [
                    'name' => 'Admin Poltekkes Jakarta 1',
                    'email' => 'admin@poltekkesjakarta1.ac.id',
                ]
            ],
            [
                'client' => [
                    'name' => 'Politeknik Kesehatan Jakarta 2',
                    'slug' => Str::slug('Politeknik Kesehatan Jakarta 2'),
                    'alamat' => 'Jakarta',
                    'kementrian' => 'Kementerian Kesehatan',
                    'kode_satker' => '001002',
                    'type' => 'BLU',
                    'logo' => null,
                ],
                'user' => [
                    'name' => 'Admin Poltekkes Jakarta 2',
                    'email' => 'admin@poltekkesjakarta2.ac.id',
                ]
            ],
            [
                'client' => [
                    'name' => 'Balai Pendidikan dan Pelatihan Transportasi Laut',
                    'slug' => Str::slug('Balai Pendidikan dan Pelatihan Transportasi Laut'),
                    'alamat' => 'Indonesia',
                    'kementrian' => 'Kementerian Perhubungan',
                    'kode_satker' => '002001',
                    'type' => 'BLU',
                    'logo' => null,
                ],
                'user' => [
                    'name' => 'Admin BPPTL',
                    'email' => 'admin@bpptl.ac.id',
                ]
            ],
            [
                'client' => [
                    'name' => 'Universitas Islam Negeri Imam Bonjol Padang',
                    'slug' => Str::slug('Universitas Islam Negeri Imam Bonjol Padang'),
                    'alamat' => 'Jl. Prof. Mahmud Yunus Lubuk Lintah, Padang',
                    'kementrian' => 'Kementerian Agama',
                    'kode_satker' => '003001',
                    'type' => 'PTNBH',
                    'logo' => null,
                ],
                'user' => [
                    'name' => 'Admin UIN Imam Bonjol',
                    'email' => 'admin@uinib.ac.id',
                ]
            ],
            [
                'client' => [
                    'name' => 'Politeknik Kesehatan Makassar',
                    'slug' => Str::slug('Politeknik Kesehatan Makassar'),
                    'alamat' => 'Makassar',
                    'kementrian' => 'Kementerian Kesehatan',
                    'kode_satker' => '001003',
                    'type' => 'BLU',
                    'logo' => null,
                ],
                'user' => [
                    'name' => 'Admin Poltekkes Makassar',
                    'email' => 'admin@poltekkesmakassar.ac.id',
                ]
            ],
            [
                'client' => [
                    'name' => 'Universitas Islam Negeri Mahmud Yunus Batusangkar',
                    'slug' => Str::slug('Universitas Islam Negeri Mahmud Yunus Batusangkar'),
                    'alamat' => 'Jl. Sudirman No. 137, Batusangkar, Sumatera Barat',
                    'kementrian' => 'Kementerian Agama',
                    'kode_satker' => '003002',
                    'type' => 'PTNBH',
                    'logo' => null,
                ],
                'user' => [
                    'name' => 'Admin UIN Batusangkar',
                    'email' => 'admin@uinmybatusangkar.ac.id',
                ]
            ],
            [
                'client' => [
                    'name' => 'Politeknik Penerbangan Indonesia Curug',
                    'slug' => Str::slug('Politeknik Penerbangan Indonesia Curug'),
                    'alamat' => 'Curug, Tangerang',
                    'kementrian' => 'Kementerian Perhubungan',
                    'kode_satker' => '002002',
                    'type' => 'BLU',
                    'logo' => null,
                ],
                'user' => [
                    'name' => 'Admin PPI Curug',
                    'email' => 'admin@ppicurug.ac.id',
                ]
            ],
            [
                'client' => [
                    'name' => 'Politeknik Pelayaran Banten',
                    'slug' => Str::slug('Politeknik Pelayaran Banten'),
                    'alamat' => 'Banten',
                    'kementrian' => 'Kementerian Perhubungan',
                    'kode_satker' => '002003',
                    'type' => 'BLU',
                    'logo' => null,
                ],
                'user' => [
                    'name' => 'Admin Politeknik Pelayaran Banten',
                    'email' => 'admin@polpelbanten.ac.id',
                ]
            ],
            [
                'client' => [
                    'name' => 'Politeknik Negeri Ujung Pandang',
                    'slug' => Str::slug('Politeknik Negeri Ujung Pandang'),
                    'alamat' => 'Ujung Pandang, Makassar',
                    'kementrian' => 'Kementerian Pendidikan',
                    'kode_satker' => '004001',
                    'type' => 'BLU',
                    'logo' => null,
                ],
                'user' => [
                    'name' => 'Admin PNUP',
                    'email' => 'admin@pnup.ac.id',
                ]
            ],
            [
                'client' => [
                    'name' => 'Universitas Islam Negeri Sjech M. Djamil Djambek Bukittinggi',
                    'slug' => Str::slug('Universitas Islam Negeri Sjech M. Djamil Djambek Bukittinggi'),
                    'alamat' => 'Bukittinggi',
                    'kementrian' => 'Kementerian Agama',
                    'kode_satker' => '003003',
                    'type' => 'PTNBH',
                    'logo' => null,
                ],
                'user' => [
                    'name' => 'Admin UIN Bukittinggi',
                    'email' => 'admin@uinbukittinggi.ac.id',
                ]
            ],
            [
                'client' => [
                    'name' => 'Politeknik Kesehatan Bandung',
                    'slug' => Str::slug('Politeknik Kesehatan Bandung'),
                    'alamat' => 'Bandung',
                    'kementrian' => 'Kementerian Kesehatan',
                    'kode_satker' => '001004',
                    'type' => 'BLU',
                    'logo' => null,
                ],
                'user' => [
                    'name' => 'Admin Poltekkes Bandung',
                    'email' => 'admin@poltekkesbandbung.ac.id',
                ]
            ],
            [
                'client' => [
                    'name' => 'Balai Inseminasi Buatan (BIB) Lembang',
                    'slug' => Str::slug('Balai Inseminasi Buatan (BIB) Lembang'),
                    'alamat' => 'Lembang, Bandung',
                    'kementrian' => 'Kementerian Pertanian',
                    'kode_satker' => '005001',
                    'type' => 'BLU',
                    'logo' => null,
                ],
                'user' => [
                    'name' => 'Admin BIB Lembang',
                    'email' => 'admin@biblembang.go.id',
                ]
            ],
            [
                'client' => [
                    'name' => 'Sekolah Tinggi Ilmu Pelayaran Jakarta',
                    'slug' => Str::slug('Sekolah Tinggi Ilmu Pelayaran Jakarta'),
                    'alamat' => 'Jakarta',
                    'kementrian' => 'Kementerian Perhubungan',
                    'kode_satker' => '002004',
                    'type' => 'BLU',
                    'logo' => null,
                ],
                'user' => [
                    'name' => 'Admin STIP Jakarta',
                    'email' => 'admin@stipjakarta.ac.id',
                ]
            ],
            [
                'client' => [
                    'name' => 'Universitas Islam Negeri Alauddin Makassar',
                    'slug' => Str::slug('Universitas Islam Negeri Alauddin Makassar'),
                    'alamat' => 'Jl. Sultan Alauddin No. 63, Makassar',
                    'kementrian' => 'Kementerian Agama',
                    'kode_satker' => '003004',
                    'type' => 'PTNBH',
                    'logo' => null,
                ],
                'user' => [
                    'name' => 'Admin UIN Alauddin',
                    'email' => 'admin@uin-alauddin.ac.id',
                ]
            ],
            [
                'client' => [
                    'name' => 'Universitas Islam Negeri Sutan Syarif Kasim Riau',
                    'slug' => Str::slug('Universitas Islam Negeri Sutan Syarif Kasim Riau'),
                    'alamat' => 'Riau',
                    'kementrian' => 'Kementerian Agama',
                    'kode_satker' => '003005',
                    'type' => 'PTNBH',
                    'logo' => null,
                ],
                'user' => [
                    'name' => 'Admin UIN Suska Riau',
                    'email' => 'admin@uin-suska.ac.id',
                ]
            ],
            [
                'client' => [
                    'name' => 'Politeknik Perkeretaapian Indonesia Madiun',
                    'slug' => Str::slug('Politeknik Perkeretaapian Indonesia Madiun'),
                    'alamat' => 'Madiun',
                    'kementrian' => 'Kementerian Perhubungan',
                    'kode_satker' => '002005',
                    'type' => 'BLU',
                    'logo' => null,
                ],
                'user' => [
                    'name' => 'Admin PPI Madiun',
                    'email' => 'admin@ppimadiun.ac.id',
                ]
            ],
            [
                'client' => [
                    'name' => 'Universitas Islam Negeri Raden Fatah Palembang',
                    'slug' => Str::slug('Universitas Islam Negeri Raden Fatah Palembang'),
                    'alamat' => 'Palembang',
                    'kementrian' => 'Kementerian Agama',
                    'kode_satker' => '003006',
                    'type' => 'PTNBH',
                    'logo' => null,
                ],
                'user' => [
                    'name' => 'Admin UIN Raden Fatah',
                    'email' => 'admin@radenfatah.ac.id',
                ]
            ],
            [
                'client' => [
                    'name' => 'Universitas Islam Negeri Palopo',
                    'slug' => Str::slug('Universitas Islam Negeri Palopo'),
                    'alamat' => 'Palopo',
                    'kementrian' => 'Kementerian Agama',
                    'kode_satker' => '003007',
                    'type' => 'PTNBH',
                    'logo' => null,
                ],
                'user' => [
                    'name' => 'Admin UIN Palopo',
                    'email' => 'admin@uinpalopo.ac.id',
                ]
            ],
            [
                'client' => [
                    'name' => 'Universitas Islam Negeri Siber Syekh Nurjati Cirebon',
                    'slug' => Str::slug('Universitas Islam Negeri Siber Syekh Nurjati Cirebon'),
                    'alamat' => 'Cirebon',
                    'kementrian' => 'Kementerian Agama',
                    'kode_satker' => '003008',
                    'type' => 'PTNBH',
                    'logo' => null,
                ],
                'user' => [
                    'name' => 'Admin UIN Cirebon',
                    'email' => 'admin@syekhnurjati.ac.id',
                ]
            ],
            [
                'client' => [
                    'name' => 'Politeknik Kesehatan Maluku',
                    'slug' => Str::slug('Politeknik Kesehatan Maluku'),
                    'alamat' => 'Maluku',
                    'kementrian' => 'Kementerian Kesehatan',
                    'kode_satker' => '001005',
                    'type' => 'BLU',
                    'logo' => null,
                ],
                'user' => [
                    'name' => 'Admin Poltekkes Maluku',
                    'email' => 'admin@poltekkesmaluku.ac.id',
                ]
            ],
            [
                'client' => [
                    'name' => 'Universitas Islam Negeri Maulana Malik Ibrahim Malang',
                    'slug' => Str::slug('Universitas Islam Negeri Maulana Malik Ibrahim Malang'),
                    'alamat' => 'Malang',
                    'kementrian' => 'Kementerian Agama',
                    'kode_satker' => '003009',
                    'type' => 'PTNBH',
                    'logo' => null,
                ],
                'user' => [
                    'name' => 'Admin UIN Malang',
                    'email' => 'admin@uin-malang.ac.id',
                ]
            ],
            [
                'client' => [
                    'name' => 'Universitas Islam Negeri Yogyakarta',
                    'slug' => Str::slug('Universitas Islam Negeri Yogyakarta'),
                    'alamat' => 'Yogyakarta',
                    'kementrian' => 'Kementerian Agama',
                    'kode_satker' => '003010',
                    'type' => 'PTNBH',
                    'logo' => null,
                ],
                'user' => [
                    'name' => 'Admin UIN Yogyakarta',
                    'email' => 'admin@uin-suka.ac.id',
                ]
            ],
            [
                'client' => [
                    'name' => 'Politeknik Kesehatan Pontianak',
                    'slug' => Str::slug('Politeknik Kesehatan Pontianak'),
                    'alamat' => 'Pontianak',
                    'kementrian' => 'Kementerian Kesehatan',
                    'kode_satker' => '001006',
                    'type' => 'BLU',
                    'logo' => null,
                ],
                'user' => [
                    'name' => 'Admin Poltekkes Pontianak',
                    'email' => 'admin@poltekkespontianak.ac.id',
                ]
            ],
            [
                'client' => [
                    'name' => 'Politeknik Keuangan Negara STAN',
                    'slug' => Str::slug('Politeknik Keuangan Negara STAN'),
                    'alamat' => 'Tangerang Selatan',
                    'kementrian' => 'Kementerian Keuangan',
                    'kode_satker' => '006001',
                    'type' => 'BLU',
                    'logo' => null,
                ],
                'user' => [
                    'name' => 'Admin PKN STAN',
                    'email' => 'admin@pknstan.ac.id',
                ]
            ],
            [
                'client' => [
                    'name' => 'Politeknik Kesehatan Kalimantan Timur',
                    'slug' => Str::slug('Politeknik Kesehatan Kalimantan Timur'),
                    'alamat' => 'Kalimantan Timur',
                    'kementrian' => 'Kementerian Kesehatan',
                    'kode_satker' => '001007',
                    'type' => 'BLU',
                    'logo' => null,
                ],
                'user' => [
                    'name' => 'Admin Poltekkes Kaltim',
                    'email' => 'admin@poltekkeskaltim.ac.id',
                ]
            ],
            [
                'client' => [
                    'name' => 'Universitas Islam Negeri Ar-Raniry Aceh',
                    'slug' => Str::slug('Universitas Islam Negeri Ar-Raniry Aceh'),
                    'alamat' => 'Banda Aceh',
                    'kementrian' => 'Kementerian Agama',
                    'kode_satker' => '003011',
                    'type' => 'PTNBH',
                    'logo' => null,
                ],
                'user' => [
                    'name' => 'Admin UIN Ar-Raniry',
                    'email' => 'admin@ar-raniry.ac.id',
                ]
            ],
            [
                'client' => [
                    'name' => 'Politeknik Penerbangan Surabaya',
                    'slug' => Str::slug('Politeknik Penerbangan Surabaya'),
                    'alamat' => 'Surabaya',
                    'kementrian' => 'Kementerian Perhubungan',
                    'kode_satker' => '002006',
                    'type' => 'BLU',
                    'logo' => null,
                ],
                'user' => [
                    'name' => 'Admin PP Surabaya',
                    'email' => 'admin@ppsurabaya.ac.id',
                ]
            ],
            [
                'client' => [
                    'name' => 'Universitas Islam Negeri K.H. Abdurrahman Wahid Pekalongan',
                    'slug' => Str::slug('Universitas Islam Negeri K.H. Abdurrahman Wahid Pekalongan'),
                    'alamat' => 'Jl. Kusuma Bangsa No. 9, Pekalongan',
                    'kementrian' => 'Kementerian Agama',
                    'kode_satker' => '003012',
                    'type' => 'PTNBH',
                    'logo' => null,
                ],
                'user' => [
                    'name' => 'Admin UIN Pekalongan',
                    'email' => 'admin@uingusdur.ac.id',
                ]
            ],
            [
                'client' => [
                    'name' => 'Politeknik Pelayaran Surabaya',
                    'slug' => Str::slug('Politeknik Pelayaran Surabaya'),
                    'alamat' => 'Surabaya',
                    'kementrian' => 'Kementerian Perhubungan',
                    'kode_satker' => '002007',
                    'type' => 'BLU',
                    'logo' => null,
                ],
                'user' => [
                    'name' => 'Admin Politeknik Pelayaran Surabaya',
                    'email' => 'admin@polpelsurabaya.ac.id',
                ]
            ],
            [
                'client' => [
                    'name' => 'Universitas Islam Negeri Salatiga',
                    'slug' => Str::slug('Universitas Islam Negeri Salatiga'),
                    'alamat' => 'Salatiga',
                    'kementrian' => 'Kementerian Agama',
                    'kode_satker' => '003013',
                    'type' => 'PTNBH',
                    'logo' => null,
                ],
                'user' => [
                    'name' => 'Admin UIN Salatiga',
                    'email' => 'admin@uinsalatiga.ac.id',
                ]
            ],
            [
                'client' => [
                    'name' => 'Politeknik Kesehatan Medan',
                    'slug' => Str::slug('Politeknik Kesehatan Medan'),
                    'alamat' => 'Medan',
                    'kementrian' => 'Kementerian Kesehatan',
                    'kode_satker' => '001008',
                    'type' => 'BLU',
                    'logo' => null,
                ],
                'user' => [
                    'name' => 'Admin Poltekkes Medan',
                    'email' => 'admin@poltekkesmedan.ac.id',
                ]
            ],
            [
                'client' => [
                    'name' => 'Universitas Islam Negeri Mataram',
                    'slug' => Str::slug('Universitas Islam Negeri Mataram'),
                    'alamat' => 'Jl. Gajah Mada No. 100, Mataram, NTB',
                    'kementrian' => 'Kementerian Agama',
                    'kode_satker' => '003014',
                    'type' => 'PTNBH',
                    'logo' => null,
                ],
                'user' => [
                    'name' => 'Admin UIN Mataram',
                    'email' => 'admin@uinmataram.ac.id',
                ]
            ],
            [
                'client' => [
                    'name' => 'Rumah Sakit Umum Daerah (RSUD) Gunung Jati Kota Cirebon',
                    'slug' => Str::slug('Rumah Sakit Umum Daerah (RSUD) Gunung Jati Kota Cirebon'),
                    'alamat' => 'Cirebon',
                    'kementrian' => 'Kementerian Kesehatan',
                    'kode_satker' => '001009',
                    'type' => 'BLUD',
                    'logo' => null,
                ],
                'user' => [
                    'name' => 'Admin RSUD Gunung Jati',
                    'email' => 'admin@rsudgunungjati.go.id',
                ]
            ],
            [
                'client' => [
                    'name' => 'Badan Penyelenggara Jaminan Produk Halal (BPJPH)',
                    'slug' => Str::slug('Badan Penyelenggara Jaminan Produk Halal (BPJPH)'),
                    'alamat' => 'Jakarta',
                    'kementrian' => 'Kementerian Agama',
                    'kode_satker' => '003015',
                    'type' => 'BLU',
                    'logo' => null,
                ],
                'user' => [
                    'name' => 'Admin BPJPH',
                    'email' => 'admin@halal.go.id',
                ]
            ],
            
            // ========== NEWLY ADDED CLIENTS ==========
            [
                'client' => [
                    'name' => 'Politeknik Kesehatan Kementerian Kesehatan Kupang',
                    'slug' => Str::slug('Politeknik Kesehatan Kementerian Kesehatan Kupang'),
                    'alamat' => 'Kupang, Nusa Tenggara Timur',
                    'kementrian' => 'Kementerian Kesehatan',
                    'kode_satker' => '001010',
                    'type' => 'BLU',
                    'logo' => null,
                ],
                'user' => [
                    'name' => 'Admin Poltekkes Kupang',
                    'email' => 'admin@poltekkeskupang.ac.id',
                ]
            ],
            [
                'client' => [
                    'name' => 'Politeknik Kesehatan Kementerian Kesehatan Tanjung Karang',
                    'slug' => Str::slug('Politeknik Kesehatan Kementerian Kesehatan Tanjung Karang'),
                    'alamat' => 'Tanjung Karang, Bandar Lampung',
                    'kementrian' => 'Kementerian Kesehatan',
                    'kode_satker' => '001011',
                    'type' => 'BLU',
                    'logo' => null,
                ],
                'user' => [
                    'name' => 'Admin Poltekkes Tanjung Karang',
                    'email' => 'admin@poltekkestjk.ac.id',
                ]
            ],
            [
                'client' => [
                    'name' => 'Politeknik Kesehatan Kementerian Kesehatan Yogyakarta',
                    'slug' => Str::slug('Politeknik Kesehatan Kementerian Kesehatan Yogyakarta'),
                    'alamat' => 'Yogyakarta',
                    'kementrian' => 'Kementerian Kesehatan',
                    'kode_satker' => '001012',
                    'type' => 'BLU',
                    'logo' => null,
                ],
                'user' => [
                    'name' => 'Admin Poltekkes Yogyakarta',
                    'email' => 'admin@poltekkesyogyakarta.ac.id',
                ]
            ],
            [
                'client' => [
                    'name' => 'Politeknik Kesehatan Kementerian Kesehatan Surakarta',
                    'slug' => Str::slug('Politeknik Kesehatan Kementerian Kesehatan Surakarta'),
                    'alamat' => 'Surakarta, Jawa Tengah',
                    'kementrian' => 'Kementerian Kesehatan',
                    'kode_satker' => '001013',
                    'type' => 'BLU',
                    'logo' => null,
                ],
                'user' => [
                    'name' => 'Admin Poltekkes Surakarta',
                    'email' => 'admin@poltekkessurakarta.ac.id',
                ]
            ],
            [
                'client' => [
                    'name' => 'Politeknik Penerbangan Palembang',
                    'slug' => Str::slug('Politeknik Penerbangan Palembang'),
                    'alamat' => 'Palembang, Sumatera Selatan',
                    'kementrian' => 'Kementerian Perhubungan',
                    'kode_satker' => '002008',
                    'type' => 'BLU',
                    'logo' => null,
                ],
                'user' => [
                    'name' => 'Admin PP Palembang',
                    'email' => 'admin@pppalembang.ac.id',
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
