<?php

namespace Database\Seeders;

use App\Models\News;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class NewsSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('role', 'admin')->first();

        if (!$admin) {
            $this->command->warn('No admin user found. Skipping news seeder.');
            return;
        }

        $newsData = [
            [
                'title' => 'Selamat Datang di Platform AURA',
                'excerpt' => 'Platform AURA (Audit, Reporting & Analyze) adalah solusi terpadu untuk manajemen audit dan pelaporan keuangan yang modern dan efisien.',
                'content' => '<h2>Tentang Platform AURA</h2>
                <p>Platform AURA dirancang khusus untuk membantu tim audit dalam mengelola proyek-proyek audit dengan lebih efisien. Dengan fitur-fitur unggulan seperti:</p>
                <ul>
                    <li>Manajemen proyek audit yang terstruktur</li>
                    <li>Kolaborasi tim yang terintegrasi</li>
                    <li>Pelaporan real-time</li>
                    <li>Dashboard analitik yang komprehensif</li>
                </ul>
                <p>AURA memudahkan Anda dalam menjalankan setiap tahapan audit dari perencanaan hingga pelaporan akhir.</p>',
                'status' => 'published',
                'published_at' => now(),
            ],
            [
                'title' => 'Update Sistem: Fitur Baru di Q4 2025',
                'excerpt' => 'Kami dengan bangga mengumumkan peluncuran fitur-fitur baru yang akan meningkatkan produktivitas tim audit Anda.',
                'content' => '<h2>Fitur Baru yang Tersedia</h2>
                <h3>1. Login Security Monitoring</h3>
                <p>Sistem keamanan login yang canggih untuk melindungi akun dari akses yang tidak sah dengan monitoring real-time.</p>
                
                <h3>2. Advanced Team Management</h3>
                <p>Kelola tim proyek dengan lebih mudah, assign tasks, dan pantau progress setiap anggota tim.</p>
                
                <h3>3. Template Management</h3>
                <p>Buat dan kelola template audit untuk mempercepat proses setup proyek baru.</p>
                
                <h3>4. Client Portal</h3>
                <p>Portal khusus untuk klien agar dapat memantau progress audit mereka secara real-time.</p>
                
                <p><strong>Mulai gunakan fitur-fitur baru ini sekarang juga!</strong></p>',
                'status' => 'published',
                'published_at' => now()->subDays(2),
            ],
            [
                'title' => 'Tips: Best Practices dalam Audit Management',
                'excerpt' => 'Pelajari praktik terbaik dalam mengelola proyek audit untuk hasil yang optimal dan efisien.',
                'content' => '<h2>Best Practices Audit Management</h2>
                
                <h3>1. Perencanaan yang Matang</h3>
                <p>Selalu mulai dengan perencanaan yang detail. Identifikasi scope, timeline, dan resources yang dibutuhkan.</p>
                
                <h3>2. Komunikasi yang Efektif</h3>
                <p>Pastikan semua anggota tim memahami peran dan tanggung jawab masing-masing. Gunakan fitur collaboration di AURA.</p>
                
                <h3>3. Dokumentasi yang Lengkap</h3>
                <p>Dokumentasikan setiap langkah audit dengan rapi. AURA menyediakan sistem dokumentasi yang terstruktur.</p>
                
                <h3>4. Review Berkala</h3>
                <p>Lakukan review progress secara berkala untuk memastikan audit berjalan sesuai rencana.</p>
                
                <h3>5. Gunakan Template</h3>
                <p>Manfaatkan template yang sudah tersedia untuk menghemat waktu dan memastikan konsistensi.</p>',
                'status' => 'published',
                'published_at' => now()->subDays(5),
            ],
            [
                'title' => '[DRAFT] Upcoming: Integration dengan Aplikasi Pihak Ketiga',
                'excerpt' => 'Segera hadir integrasi dengan berbagai aplikasi populer untuk meningkatkan produktivitas Anda.',
                'content' => '<h2>Integrasi yang Akan Datang</h2>
                <p>Kami sedang mengembangkan integrasi dengan:</p>
                <ul>
                    <li>Microsoft Office 365</li>
                    <li>Google Workspace</li>
                    <li>Slack untuk notifikasi</li>
                    <li>Zapier untuk automation</li>
                </ul>
                <p>Stay tuned untuk update selanjutnya!</p>',
                'status' => 'draft',
                'published_at' => null,
            ],
        ];

        foreach ($newsData as $data) {
            News::create([
                ...$data,
                'slug' => Str::slug($data['title']),
                'created_by' => $admin->id,
            ]);
        }

        $this->command->info('News seeded successfully!');
    }
}

