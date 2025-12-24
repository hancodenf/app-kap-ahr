<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\Project;
use App\Models\ProjectTeam;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $clients = Client::all();
        $user = User::all();

        $array = [
            ['val0' => 'Politeknik Kesehatan Kementerian Kesehatan Kupang', 'val1' => 'Kementerian Kesehatan', 'val2' => 'Syamsul Bahri', 'val3' => '-', 'val4' => '-', 'val5' => 'Khairunnissa', 'val6' => 'Satrio Bayu Wibowo', 'val7' => 'Fakhira Rifa Adinda', 'val8' => 'Raden Panji Rangga Prasetyo'],
            ['val0' => 'Politeknik Kesehatan Kementerian Kesehatan Tanjung Karang', 'val1' => 'Kementerian Kesehatan', 'val2' => 'Syamsul Bahri', 'val3' => '-', 'val4' => '-', 'val5' => 'Khairunnissa', 'val6' => 'Satrio Bayu Wibowo', 'val7' => 'Muhamad Rizky', 'val8' => 'Zulya Fathul Jannah'],
            ['val0' => 'Politeknik Kesehatan Kementerian Kesehatan Yogyakarta', 'val1' => 'Kementerian Kesehatan', 'val2' => 'Syamsul Bahri', 'val3' => '-', 'val4' => '-', 'val5' => 'Khairunnissa', 'val6' => 'Raden Panji Rangga Prasetyo', 'val7' => 'Muhamad Rizky', 'val8' => 'Zulya Fathul Jannah'],
            ['val0' => 'Politeknik Kesehatan Kementerian Kesehatan Surakarta', 'val1' => 'Kementerian Kesehatan', 'val2' => 'Syamsul Bahri', 'val3' => '-', 'val4' => '-', 'val5' => 'Khairunnissa', 'val6' => 'Fakhira Rifa Adinda', 'val7' => 'Satrio Bayu Wibowo', 'val8' => 'Diva Muzdalipah'],
            ['val0' => 'Politeknik Penerbangan Palembang', 'val1' => 'Kementerian Perhubungan', 'val2' => 'Syamsul Bahri', 'val3' => '-', 'val4' => '-', 'val5' => 'Khairunnissa', 'val6' => 'Muhamad Rizky', 'val7' => 'Raden Panji Rangga Prasetyo', 'val8' => 'Fakhira Rifa Adinda'],
            ['val0' => 'Politeknik Kesehatan Jakarta 1', 'val1' => 'Kementerian Kesehatan', 'val2' => 'Wilda Farah', 'val3' => '-', 'val4' => 'Soliyah Wulandari', 'val5' => 'Fachriza Fayyad Fauzan', 'val6' => 'Bayu Dwi Cahyanto', 'val7' => 'Ananda Mohammad Rizky', 'val8' => '-'],
            ['val0' => 'Politeknik Kesehatan Jakarta 2 ', 'val1' => 'Kementerian Kesehatan', 'val2' => 'Abdul Hamid', 'val3' => '-', 'val4' => 'Tumiran Tawirana', 'val5' => 'Irma Nuranisa', 'val6' => 'Jeremi Octavianus Iroth', 'val7' => 'Cavin Valeri Nayotama', 'val8' => '-'],
            ['val0' => 'Balai Pendidikan dan Pelatihan Transportasi Laut ', 'val1' => 'Kementerian Perhubungan', 'val2' => 'Abdul Hamid', 'val3' => 'Wilda Farah', 'val4' => '-', 'val5' => 'Fachriza Fayyad Fauzan', 'val6' => 'Muhammad Rifky Effendy', 'val7' => 'Ananda Mohammad Rizky', 'val8' => '-'],
            ['val0' => 'Universitas Islam Negeri Imam Bonjol Padang', 'val1' => 'Kementerian Agama', 'val2' => 'Abdul Hamid', 'val3' => '-', 'val4' => 'Soliyah Wulandari', 'val5' => 'Bayu Dwi Cahyanto', 'val6' => 'Ria Afrizal', 'val7' => 'Muhammad Husni Faris', 'val8' => '-'],
            ['val0' => 'Politeknik Kesehatan Makassar', 'val1' => 'Kementerian Kesehatan', 'val2' => 'Wilda Farah', 'val3' => '-', 'val4' => 'Suhartono', 'val5' => 'Ananda Mohammad Rizky', 'val6' => 'Zuhaira Fadla Fachrina', 'val7' => 'Rizka Amelia', 'val8' => '-'],
            ['val0' => 'Universitas Islam Negeri Mahmud Yunus Batusangkar', 'val1' => 'Kementerian Agama', 'val2' => 'Abdul Hamid', 'val3' => '-', 'val4' => 'Soliyah Wulandari', 'val5' => 'Bayu Dwi Cahyanto', 'val6' => 'Ria Afrizal', 'val7' => 'Muhammad Husni Faris', 'val8' => '-'],
            ['val0' => 'Politeknik Penerbangan Indonesia Curug', 'val1' => 'Kementerian Perhubungan', 'val2' => 'Abdul Hamid', 'val3' => '-', 'val4' => 'Resi Ariyasa Qadri', 'val5' => 'Muhammad Rifky Effendy', 'val6' => 'Ahmad Reski Tiarah', 'val7' => 'Muhammad Luthfian Arif', 'val8' => 'Kievo Syah Guzman'],
            ['val0' => 'Politeknik Pelayaran Banten', 'val1' => 'Kementerian Perhubungan', 'val2' => 'Abdul Hamid', 'val3' => 'Wilda Farah', 'val4' => '-', 'val5' => 'Fachriza Fayyad Fauzan', 'val6' => 'Bayu Dwi Cahyanto', 'val7' => 'Ananda Mohammad Rizky', 'val8' => '-'],
            ['val0' => 'Politeknik Negeri Ujung Pandang', 'val1' => 'Kementerian Pendidikan', 'val2' => 'Abdul Hamid', 'val3' => 'Wilda Farah', 'val4' => 'Brian Pramudita', 'val5' => 'Ananda Mohammad Rizky', 'val6' => 'Zuhaira Fadla Fachrina', 'val7' => 'Rizka Amelia', 'val8' => 'Audy Alifia Rudy'],
            ['val0' => 'Universitas Islam Negeri Sjech M. Djamil Djambek Bukittinggi', 'val1' => 'Kementerian Agama', 'val2' => 'Abdul Hamid', 'val3' => '-', 'val4' => 'Soliyah Wulandari', 'val5' => 'Bayu Dwi Cahyanto', 'val6' => 'Ria Afrizal', 'val7' => 'Muhammad Husni Faris', 'val8' => '-'],
            ['val0' => 'Politeknik Kesehatan Bandung', 'val1' => 'Kementerian Kesehatan', 'val2' => 'Abdul Hamid', 'val3' => '-', 'val4' => '-', 'val5' => 'Fachriza Fayyad Fauzan', 'val6' => 'Muhammad Rifky Effendy', 'val7' => 'Kievo Syah Guzman', 'val8' => 'Muhammad Luthfian Arif'],
            ['val0' => 'Balai Inseminasi Buatan (BIB) Lembang', 'val1' => 'Kementerian Pertanian', 'val2' => 'Abdul Hamid', 'val3' => '-', 'val4' => 'Yusar Sagara', 'val5' => 'Muhammad Rifky Effendy', 'val6' => 'Ahmad Reski Tiarah', 'val7' => '-', 'val8' => '-'],
            ['val0' => 'Sekolah Tinggi Ilmu Pelayaran Jakarta', 'val1' => 'Kementerian Perhubungan', 'val2' => 'Abdul Hamid', 'val3' => 'Wilda Farah', 'val4' => 'Tumiran Tawirana', 'val5' => 'Fachriza Fayyad Fauzan', 'val6' => 'Bayu Dwi Cahyanto', 'val7' => 'Muhammad Rifky Effendy', 'val8' => '-'],
            ['val0' => 'Universitas Islam Negeri Alauddin Makassar ', 'val1' => 'Kementerian Agama', 'val2' => 'Wilda Farah', 'val3' => 'Abdul Hamid', 'val4' => 'Brian Pramudita', 'val5' => 'Ananda Mohammad Rizky', 'val6' => 'Zuhaira Fadla Fachrina', 'val7' => 'Rizka Amelia', 'val8' => 'Audy Alifia Rudy'],
            ['val0' => 'Universitas Islam Negeri Sutan Syarif Kasim Riau', 'val1' => 'Kementerian Agama', 'val2' => 'Wilda Farah', 'val3' => 'Abdul Hamid', 'val4' => 'Soliyah Wulandari', 'val5' => 'Bayu Dwi Cahyanto', 'val6' => 'Fachriza Fayyad Fauzan', 'val7' => 'Ria Afrizal', 'val8' => 'Muhammad Husni Faris'],
            ['val0' => 'Politeknik Perkeretaapian Indonesia Madiun ', 'val1' => 'Kementerian Perhubungan', 'val2' => 'Abdul Hamid', 'val3' => '-', 'val4' => 'Resi Ariyasa Qadri', 'val5' => 'Muhammad Rifky Effendy', 'val6' => 'Ahmad Reski Tiarah', 'val7' => 'Muhammad Luthfian Arif', 'val8' => '-'],
            ['val0' => 'Universitas Islam Negeri Raden Fatah Palembang ', 'val1' => 'Kementerian Agama', 'val2' => 'Wilda Farah', 'val3' => '-', 'val4' => 'Tumiran Tawirana', 'val5' => 'Irma Nuranisa', 'val6' => 'Jeremi Octavianus Iroth', 'val7' => 'Cavin Valeri Nayotama', 'val8' => 'Nur Isnaini'],
            ['val0' => 'Universitas Islam Negeri Palopo', 'val1' => 'Kementerian Agama', 'val2' => 'Abdul Hamid', 'val3' => '-', 'val4' => 'Suhartono', 'val5' => 'Ananda Mohammad Rizky', 'val6' => 'Zuhaira Fadla Fachrina', 'val7' => 'Rizka Amelia', 'val8' => '-'],
            ['val0' => 'Universitas Islam Negeri Siber Syekh Nurjati Cirebon', 'val1' => 'Kementerian Agama', 'val2' => 'Abdul Hamid', 'val3' => '-', 'val4' => 'Tumiran Tawirana', 'val5' => 'Muhammad Rifky Effendy', 'val6' => 'Ahmad Reski Tiarah', 'val7' => 'Muhammad Luthfian Arif', 'val8' => 'Kievo Syah Guzman'],
            ['val0' => 'Politeknik Kesehatan Maluku', 'val1' => 'Kementerian Kesehatan', 'val2' => 'Wilda Farah', 'val3' => '-', 'val4' => 'Suhartono', 'val5' => 'Ananda Mohammad Rizky', 'val6' => 'Zuhaira Fadla Fachrina', 'val7' => 'Rizka Amelia', 'val8' => '-'],
            ['val0' => 'Universitas Islam Negeri Maulana Malik Ibrahim Malang', 'val1' => 'Kementerian Agama', 'val2' => 'Abdul Hamid', 'val3' => 'Wilda Farah', 'val4' => 'Tumiran Tawirana', 'val5' => 'Muhammad Rifky Effendy', 'val6' => 'Ahmad Reski Tiarah', 'val7' => 'Muhammad Luthfian Arif', 'val8' => 'Kievo Syah Guzman'],
            ['val0' => '⁠Universitas Islam Negeri Yogyakarta ', 'val1' => 'Kementerian Agama', 'val2' => 'Abdul Hamid', 'val3' => 'Wilda Farah', 'val4' => 'Syamsul Bahri', 'val5' => 'Bayu Dwi Cahyanto', 'val6' => 'Resi Ariyasa Qadri', 'val7' => 'Khairunnisa', 'val8' => 'Ria Afrizal'],
            ['val0' => 'Politeknik Kesehatan Pontianak', 'val1' => 'Kementerian Kesehatan', 'val2' => 'Wilda Farah', 'val3' => '-', 'val4' => 'Brian Pramudita', 'val5' => 'Irma Nuranisa', 'val6' => 'Jeremi Octavianus Iroth', 'val7' => 'Cavin Valeri Nayotama', 'val8' => 'Nur Isnaini'],
            ['val0' => 'Politeknik Keuangan Negara STAN', 'val1' => 'Kementerian Keuangan', 'val2' => 'Abdul Hamid', 'val3' => 'Wilda Farah', 'val4' => 'Rezky Mehta Setiadi', 'val5' => 'Fachriza Fayyad Fauzan', 'val6' => 'Soliyah Wulandari', 'val7' => 'Bayu Dwi Cahyanto', 'val8' => '-'],
            ['val0' => 'Politeknik Kesehatan Kalimantan Timur', 'val1' => 'Kementerian Kesehatan', 'val2' => 'Abdul Hamid', 'val3' => 'Wilda Farah', 'val4' => 'Suhartono', 'val5' => 'Ananda Mohammad Rizky', 'val6' => 'Zuhaira Fadla Fachrina', 'val7' => 'Rizka Amelia', 'val8' => '-'],
            ['val0' => 'Universitas Islam Negeri Ar-Raniry Aceh', 'val1' => 'Kementerian Agama', 'val2' => 'Wilda Farah', 'val3' => 'Tumiran Tawirana', 'val4' => 'Fachriza Fayyad Fauzan', 'val5' => 'Bayu Dwi Cahyanto', 'val6' => 'Ria Afrizal', 'val7' => 'Mohammad Ilham Akbar', 'val8' => '-'],
            ['val0' => 'Politeknik Penerbangan Surabaya', 'val1' => 'Kementerian Perhubungan', 'val2' => 'Abdul Hamid', 'val3' => 'Wilda Farah', 'val4' => '-', 'val5' => 'Muhammad Rifky Effendy', 'val6' => 'Ahmad Reski Tiarah', 'val7' => 'Muhammad Luthfian Arif', 'val8' => 'Kievo Syah Guzman'],
            ['val0' => 'Universitas Islam Negeri K.H. Abdurrahman Wahid Pekalongan', 'val1' => 'Kementerian Agama', 'val2' => 'Abdul Hamid', 'val3' => 'Wilda Farah', 'val4' => '-', 'val5' => 'Irma Nuranisa', 'val6' => 'Jeremi Octavianus Iroth', 'val7' => 'Cavin Valeri Nayotama', 'val8' => 'Nur Isnaini'],
            ['val0' => 'Politeknik Pelayaran Surabaya ', 'val1' => 'Kementerian Perhubungan', 'val2' => 'Abdul Hamid', 'val3' => '-', 'val4' => 'Soliyah Wulandari', 'val5' => 'Fachriza Fayyad Fauzan', 'val6' => 'Muhammad Rifky Effendy', 'val7' => 'Ahmad Reski Tiarah', 'val8' => '-'],
            ['val0' => 'Universitas Islam Negeri Salatiga', 'val1' => 'Kementerian Agama', 'val2' => 'Wilda Farah', 'val3' => '-', 'val4' => 'Soliyah Wulandari', 'val5' => 'Ananda Mohammad Rizky', 'val6' => 'Zuhaira Fadla Fachrina', 'val7' => 'Rizka Amelia', 'val8' => '-'],
            ['val0' => 'Politeknik Kesehatan Medan', 'val1' => 'Kementerian Kesehatan', 'val2' => 'Wilda Farah', 'val3' => '-', 'val4' => 'Tumiran Tawirana', 'val5' => 'Bayu Dwi Cahyanto', 'val6' => 'Ria Afrizal', 'val7' => 'Mohammad Ilham Akbar', 'val8' => '-'],
            ['val0' => 'Universitas Islam Negeri Mataram', 'val1' => 'Kementerian Agama', 'val2' => 'Abdul Hamid', 'val3' => 'Wilda Farah', 'val4' => 'Brian Pramudita', 'val5' => 'Muhammad Rifky Effendy', 'val6' => 'Ahmad Reski Tiarah', 'val7' => 'Muhammad Luthfian Arif', 'val8' => '-'],
            ['val0' => 'Rumah Sakit Umum Daerah (RSUD) Gunung Jati Kota Cirebon', 'val1' => 'Kementerian Kesehatan', 'val2' => 'Wilda Farah', 'val3' => 'Brian Pramudita', 'val4' => '-', 'val5' => 'Irma Nuranisa', 'val6' => 'Jeremi Octavianus Iroth', 'val7' => 'Cavin Valeri Nayotama', 'val8' => 'Nur Isnaini'],
            ['val0' => 'Badan Penyelenggara Jaminan Produk Halal (BPJPH)', 'val1' => 'Kementerian Agama', 'val2' => 'Abdul Hamid', 'val3' => '-', 'val4' => 'Tumiran Tawirana', 'val5' => 'Fachriza Fayyad Fauzan', 'val6' => 'Irma Nuranisa', 'val7' => 'Jeremi Octavianus Iroth', 'val8' => 'Muhammad Husni Faris'],
        ];

        foreach ($array as $index => $member) {
            $clients = Client::where('name', $member['val0'])->first();
            if ($clients) {
                $project = Project::create([
                    'name' => 'Audit ' . $clients->name . ' Tahun 2026',
                    'slug' => Str::slug('Audit ' . $clients->name . ' Tahun 2026'),
                    'client_id' => $clients->id,
                    'status' => 'In Progress',
                    'year' => 2026,

                    'client_name' => $clients->name, // Denormalized client data
                    'client_kementrian' => $clients->kementrian, // Denormalized
                    'client_kode_satker' => $clients->kode_satker, // Denormalized
                    'client_alamat' => $clients->alamat, // Denormalized
                ]);
                if ($member['val2'] != '-') {
                    $partner = User::where('name', $member['val2'])->first();
                    if (!$partner) {
                        continue; // Skip if partner not found
                    }
                    ProjectTeam::create([
                        'project_id' => $project->id,
                        'user_id' => $partner->id,
                        'role' => 'partner',
                        // Denormalized project data
                        'project_name' => $project->name,
                        'project_client_name' => $project->client_name,
                        // Denormalized user data
                        'user_name' => $partner->name,
                        'user_email' => $partner->email,
                        'user_position' => $partner->position,
                    ]);
                }
                if ($member['val3'] != '-') {
                    $manager = User::where('name', $member['val3'])->first();
                    if (!$manager) {
                        continue; // Skip if manager not found
                    }
                    ProjectTeam::create([
                        'project_id' => $project->id,
                        'user_id' => $manager->id,
                        'role' => 'manager',
                        // Denormalized project data
                        'project_name' => $project->name,
                        'project_client_name' => $project->client_name,
                        // Denormalized user data
                        'user_name' => $manager->name,
                        'user_email' => $manager->email,
                        'user_position' => $manager->position,
                    ]);
                }
                if ($member['val4'] != '-') {
                    $supervisor = User::where('name', $member['val4'])->first();
                    if (!$supervisor) {
                        continue; // Skip if supervisor not found
                    }
                    ProjectTeam::create([
                        'project_id' => $project->id,
                        'user_id' => $supervisor->id,
                        'role' => 'supervisor',
                        // Denormalized project data
                        'project_name' => $project->name,
                        'project_client_name' => $project->client_name,
                        // Denormalized user data
                        'user_name' => $supervisor->name,
                        'user_email' => $supervisor->email,
                        'user_position' => $supervisor->position,
                    ]);
                }
                if ($member['val5'] != '-') {
                    $lead = User::where('name', $member['val5'])->first();
                    if (!$lead) {
                        continue; // Skip if lead not found
                    }
                    ProjectTeam::create([
                        'project_id' => $project->id,
                        'user_id' => $lead->id,
                        'role' => 'team leader',
                        // Denormalized project data
                        'project_name' => $project->name,
                        'project_client_name' => $project->client_name,
                        // Denormalized user data
                        'user_name' => $lead->name,
                        'user_email' => $lead->email,
                        'user_position' => $lead->position,
                    ]);
                }
                for ($i = 6; $i <= 8; $i++) {
                    if ($member['val' . $i] != '-') {
                        $staff = User::where('name', $member['val' . $i])->first();
                        if (!$staff) {
                            continue; // Skip if staff not found
                        }
                        ProjectTeam::create([
                            'project_id' => $project->id,
                            'user_id' => $staff->id,
                            'role' => 'member',
                            // Denormalized project data
                            'project_name' => $project->name,
                            'project_client_name' => $project->client_name,
                            // Denormalized user data
                            'user_name' => $staff->name,
                            'user_email' => $staff->email,
                            'user_position' => $staff->position,
                        ]);
                    }
                }
            }
        }
        
        // Add some historical projects for analytics (2023-2025)
        // $this->createHistoricalProjects();
    }
    
    private function createHistoricalProjects()
    {
        $clients = Client::all();
        if ($clients->isEmpty()) {
            return;
        }
        
        $historicalYears = [2023, 2024, 2025];
        $statuses = ['Draft', 'In Progress', 'Completed', 'Suspended', 'Canceled'];
        
        foreach ($historicalYears as $year) {
            // Create 3-5 historical projects per    
            $projectCount = rand(3, 5);
            
            for ($i = 0; $i < $projectCount; $i++) {
                $randomClient = $clients->random();
                
                $projectName = "Audit {$randomClient->name} Tahun {$year}";
                $baseSlug = Str::slug($projectName);
                $uniqueSlug = $baseSlug . '-' . uniqid();
                
                $status = $statuses[array_rand($statuses)];
                $isArchived = ($year < 2025) ? (rand(1, 4) == 1) : false; // 25% chance for old projects to be archived
                
                Project::create([
                    'name' => $projectName,
                    'slug' => $uniqueSlug,
                    'client_id' => $randomClient->id,
                    'status' => $status,
                    'is_archived' => $isArchived,
                    'year' => $year,
                    'client_name' => $randomClient->name,
                    'client_kementrian' => $randomClient->kementrian,
                    'client_kode_satker' => $randomClient->kode_satker,
                    'client_alamat' => $randomClient->alamat,
                    'created_at' => now()->subYears(2026 - $year)->subMonths(rand(0, 11)),
                    'updated_at' => now()->subYears(2026 - $year)->subMonths(rand(0, 11)),
                ]);
            }
        }
    }
}
