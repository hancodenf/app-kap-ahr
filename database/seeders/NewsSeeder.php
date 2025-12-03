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
                'title' => 'Selamat Datang di Platform AURA - Revolusi Digital Audit Management',
                'excerpt' => 'Platform AURA (Audit, Reporting & Analyze) adalah solusi terpadu untuk manajemen audit dan pelaporan keuangan yang modern, efisien, dan berbasis cloud. Tingkatkan produktivitas tim audit Anda hingga 300% dengan teknologi terdepan.',
                'content' => '
                <div class="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6 md:p-8 mb-6 border-l-4 border-blue-500">
                    <h2 class="text-2xl md:text-3xl font-bold text-gray-900 mb-4">🚀 Tentang Platform AURA</h2>
                    <p class="text-base md:text-lg text-gray-800 leading-relaxed mb-6">
                        Platform AURA dirancang khusus untuk membantu tim audit dalam mengelola proyek-proyek audit dengan lebih efisien, terstruktur, dan akuntabel. Dengan menggabungkan teknologi cloud computing, real-time collaboration, dan advanced analytics, AURA menjadi partner terpercaya untuk setiap tahapan audit Anda.
                    </p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div class="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 border-t-4 border-emerald-500">
                        <div class="flex items-center mb-4">
                            <div class="bg-emerald-100 rounded-full p-3 mr-4">
                                <svg class="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                            </div>
                            <h3 class="text-xl font-bold text-gray-900">Manajemen Proyek Terstruktur</h3>
                        </div>
                        <p class="text-gray-700 leading-relaxed">
                            Kelola setiap proyek audit dengan workflow yang jelas, milestone tracking, dan task assignment yang terintegrasi. Pantau progress real-time dari planning hingga reporting.
                        </p>
                    </div>

                    <div class="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 border-t-4 border-blue-500">
                        <div class="flex items-center mb-4">
                            <div class="bg-blue-100 rounded-full p-3 mr-4">
                                <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                </svg>
                            </div>
                            <h3 class="text-xl font-bold text-gray-900">Kolaborasi Tim Seamless</h3>
                        </div>
                        <p class="text-gray-700 leading-relaxed">
                            Tingkatkan sinergi tim dengan fitur collaboration tools, real-time notifications, comments, dan file sharing yang aman. Semua anggota tim selalu ter-update.
                        </p>
                    </div>

                    <div class="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 border-t-4 border-purple-500">
                        <div class="flex items-center mb-4">
                            <div class="bg-purple-100 rounded-full p-3 mr-4">
                                <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                                </svg>
                            </div>
                            <h3 class="text-xl font-bold text-gray-900">Dashboard Analytics</h3>
                        </div>
                        <p class="text-gray-700 leading-relaxed">
                            Visualisasi data yang powerful dengan interactive charts, KPI monitoring, performance metrics, dan insights berbasis AI untuk decision making yang lebih baik.
                        </p>
                    </div>

                    <div class="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 border-t-4 border-orange-500">
                        <div class="flex items-center mb-4">
                            <div class="bg-orange-100 rounded-full p-3 mr-4">
                                <svg class="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                            </div>
                            <h3 class="text-xl font-bold text-gray-900">Pelaporan Real-Time</h3>
                        </div>
                        <p class="text-gray-700 leading-relaxed">
                            Generate laporan audit otomatis dengan template profesional. Export ke multiple format (PDF, Excel, Word) dengan satu klik. Audit trail lengkap tersimpan aman.
                        </p>
                    </div>
                </div>

                <div class="bg-gradient-to-r from-indigo-600 to-blue-500 rounded-xl p-8 mb-6">
                    <h3 class="text-2xl font-bold mb-4">💡 Mengapa Memilih AURA?</h3>
                    <ul class="space-y-3">
                        <li class="flex items-start">
                            <span class="text-yellow-300 font-bold text-xl mr-3">✓</span>
                            <span class="text-lg"><strong>Efisiensi Waktu:</strong> Hemat hingga 60% waktu dengan automation dan template</span>
                        </li>
                        <li class="flex items-start">
                            <span class="text-yellow-300 font-bold text-xl mr-3">✓</span>
                            <span class="text-lg"><strong>Keamanan Data:</strong> Enkripsi end-to-end, backup otomatis, dan compliance GDPR</span>
                        </li>
                        <li class="flex items-start">
                            <span class="text-yellow-300 font-bold text-xl mr-3">✓</span>
                            <span class="text-lg"><strong>Skalabilitas:</strong> Dari startup hingga enterprise, AURA tumbuh bersama bisnis Anda</span>
                        </li>
                        <li class="flex items-start">
                            <span class="text-yellow-300 font-bold text-xl mr-3">✓</span>
                            <span class="text-lg"><strong>Support 24/7:</strong> Tim expert kami siap membantu kapanpun Anda membutuhkan</span>
                        </li>
                    </ul>
                </div>

                <div class="bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg p-6">
                    <p class="text-lg text-gray-800 font-semibold mb-2">🎯 Siap Memulai?</p>
                    <p class="text-gray-700">
                        AURA memudahkan Anda dalam menjalankan setiap tahapan audit dari perencanaan, pelaksanaan, hingga pelaporan akhir. Bergabunglah dengan 500+ perusahaan yang telah mempercayai AURA untuk transformasi digital audit mereka.
                    </p>
                </div>
                ',
                'status' => 'published',
                'published_at' => now(),
            ],
            [
                'title' => 'Update Terbaru Q4 2025: 8 Fitur Premium yang Mengubah Cara Anda Bekerja',
                'excerpt' => 'Kami dengan bangga mengumumkan peluncuran 8 fitur premium terbaru yang dirancang untuk meningkatkan produktivitas tim audit hingga 250%. Dari AI-powered insights hingga advanced security monitoring, temukan bagaimana fitur-fitur ini menghemat waktu dan biaya operasional Anda.',
                'content' => '
                <div class="relative bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-2xl p-1 mb-8">
                    <div class="bg-white rounded-xl p-8">
                        <div class="flex items-center justify-between mb-6">
                            <span class="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-purple-500 to-pink-500">
                                🎉 NEW RELEASE
                            </span>
                            <span class="text-gray-500 font-semibold">Q4 2025</span>
                        </div>
                        <h2 class="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Fitur Premium Terbaru</h2>
                        <p class="text-lg md:text-xl text-gray-700 leading-relaxed">
                            Setelah berbulan-bulan riset dan pengembangan, kami memperkenalkan 8 fitur revolusioner yang akan mengubah cara tim audit Anda bekerja. Lebih cepat, lebih aman, lebih efisien.
                        </p>
                    </div>
                </div>

                <div class="mb-8">
                    <div class="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-8 mb-6 border border-blue-200">
                        <div class="flex items-start">
                            <div class="flex-shrink-0">
                                <div class="flex items-center justify-center h-16 w-16 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-2xl font-bold shadow-lg">
                                    1
                                </div>
                            </div>
                            <div class="ml-6 flex-1">
                                <h3 class="text-2xl font-bold text-gray-900 mb-3">🔐 Advanced Security Monitoring</h3>
                                <p class="text-gray-700 mb-4 leading-relaxed">
                                    Sistem keamanan berlapis dengan AI-powered threat detection yang memantau setiap aktivitas login dan akses data secara real-time. Lindungi aset digital perusahaan Anda dari ancaman cyber.
                                </p>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div class="flex items-start space-x-3">
                                        <svg class="w-6 h-6 text-green-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                        </svg>
                                        <span class="text-gray-700">Two-Factor Authentication (2FA)</span>
                                    </div>
                                    <div class="flex items-start space-x-3">
                                        <svg class="w-6 h-6 text-green-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                        </svg>
                                        <span class="text-gray-700">Failed Login Attempt Tracking</span>
                                    </div>
                                    <div class="flex items-start space-x-3">
                                        <svg class="w-6 h-6 text-green-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                        </svg>
                                        <span class="text-gray-700">Suspicious Activity Alerts</span>
                                    </div>
                                    <div class="flex items-start space-x-3">
                                        <svg class="w-6 h-6 text-green-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                        </svg>
                                        <span class="text-gray-700">IP Whitelist Management</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-8 mb-6 border border-emerald-200">
                        <div class="flex items-start">
                            <div class="flex-shrink-0">
                                <div class="flex items-center justify-center h-16 w-16 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-2xl font-bold shadow-lg">
                                    2
                                </div>
                            </div>
                            <div class="ml-6 flex-1">
                                <h3 class="text-2xl font-bold text-gray-900 mb-3">👥 Smart Team Management</h3>
                                <p class="text-gray-700 mb-4 leading-relaxed">
                                    Kelola tim dengan lebih intelligent menggunakan AI workload balancing, skill-based task assignment, dan performance analytics. Maksimalkan produktivitas setiap anggota tim.
                                </p>
                                <div class="bg-white rounded-lg p-4 shadow-sm">
                                    <div class="flex items-center justify-between mb-2">
                                        <span class="text-sm font-semibold text-gray-700">Workload Distribution</span>
                                        <span class="text-sm font-bold text-emerald-600">Optimal</span>
                                    </div>
                                    <div class="w-full bg-gray-200 rounded-full h-2.5">
                                        <div class="bg-gradient-to-r from-emerald-500 to-teal-500 h-2.5 rounded-full" style="width: 95%"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-8 mb-6 border border-purple-200">
                        <div class="flex items-start">
                            <div class="flex-shrink-0">
                                <div class="flex items-center justify-center h-16 w-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 text-2xl font-bold shadow-lg">
                                    3
                                </div>
                            </div>
                            <div class="ml-6 flex-1">
                                <h3 class="text-2xl font-bold text-gray-900 mb-3">📋 Dynamic Template Builder</h3>
                                <p class="text-gray-700 mb-4 leading-relaxed">
                                    Buat, customize, dan share template audit dengan drag-and-drop builder yang intuitif. Library 50+ pre-built templates siap pakai untuk berbagai jenis audit.
                                </p>
                                <div class="flex flex-wrap gap-2">
                                    <span class="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">Financial Audit</span>
                                    <span class="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-medium">IT Audit</span>
                                    <span class="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">Operational Audit</span>
                                    <span class="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">Compliance Check</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-8 mb-6 border border-orange-200">
                        <div class="flex items-start">
                            <div class="flex-shrink-0">
                                <div class="flex items-center justify-center h-16 w-16 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 text-2xl font-bold shadow-lg">
                                    4
                                </div>
                            </div>
                            <div class="ml-6 flex-1">
                                <h3 class="text-2xl font-bold text-gray-900 mb-3">🌐 Interactive Client Portal</h3>
                                <p class="text-gray-700 mb-4 leading-relaxed">
                                    Berikan akses terkontrol kepada klien untuk memantau progress audit mereka secara real-time. White-label ready dengan branding perusahaan Anda.
                                </p>
                                <ul class="space-y-2">
                                    <li class="flex items-center text-gray-700">
                                        <span class="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                                        Real-time Project Status Dashboard
                                    </li>
                                    <li class="flex items-center text-gray-700">
                                        <span class="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                                        Secure Document Sharing & Upload
                                    </li>
                                    <li class="flex items-center text-gray-700">
                                        <span class="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                                        Direct Communication Channel
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div class="bg-white rounded-xl shadow-lg p-6 border-l-4 border-indigo-500 hover:shadow-2xl transition-shadow">
                        <div class="flex items-center mb-4">
                            <span class="text-3xl mr-3">🤖</span>
                            <h4 class="text-lg font-bold text-gray-900">AI-Powered Insights</h4>
                        </div>
                        <p class="text-gray-700 text-sm md:text-base leading-relaxed">
                            Machine learning algorithms menganalisis pola audit dan memberikan rekomendasi actionable untuk meningkatkan efisiensi proses audit.
                        </p>
                    </div>

                    <div class="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500 hover:shadow-2xl transition-shadow">
                        <div class="flex items-center mb-4">
                            <span class="text-3xl mr-3">📊</span>
                            <h4 class="text-lg font-bold text-gray-900">Advanced Reporting Engine</h4>
                        </div>
                        <p class="text-gray-700 text-sm md:text-base leading-relaxed">
                            Generate laporan dengan 20+ format berbeda, custom charts, automated scheduling, dan multi-channel distribution (email, cloud, API).
                        </p>
                    </div>

                    <div class="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-2xl transition-shadow">
                        <div class="flex items-center mb-4">
                            <span class="text-3xl mr-3">⚡</span>
                            <h4 class="text-lg font-bold text-gray-900">Performance Optimization</h4>
                        </div>
                        <p class="text-gray-700 text-sm md:text-base leading-relaxed">
                            Loading time 70% lebih cepat dengan server infrastructure upgrade dan caching optimization. Akses lancar dari device apapun.
                        </p>
                    </div>

                    <div class="bg-white rounded-xl shadow-lg p-6 border-l-4 border-pink-500 hover:shadow-2xl transition-shadow">
                        <div class="flex items-center mb-4">
                            <span class="text-3xl mr-3">🔄</span>
                            <h4 class="text-lg font-bold text-gray-900">Third-Party Integrations</h4>
                        </div>
                        <p class="text-gray-700 text-sm md:text-base leading-relaxed">
                            Koneksi seamless dengan 100+ tools populer seperti Slack, Microsoft Teams, Google Workspace, Jira, dan accounting software.
                        </p>
                    </div>
                </div>

                <div class="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 mb-8">
                    <div class="text-center">
                        <h3 class="text-3xl font-bold mb-4">📈 Dampak Nyata untuk Bisnis Anda</h3>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                            <div class="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                                <div class="text-5xl font-extrabold mb-2">250%</div>
                                <div class="text-lg font-semibold">Peningkatan Produktivitas</div>
                            </div>
                            <div class="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                                <div class="text-5xl font-extrabold mb-2">60%</div>
                                <div class="text-lg font-semibold">Penghematan Waktu</div>
                            </div>
                            <div class="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                                <div class="text-5xl font-extrabold mb-2">99.9%</div>
                                <div class="text-lg font-semibold">Uptime Guarantee</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="bg-green-50 border-2 border-green-300 rounded-xl p-6">
                    <div class="flex items-start">
                        <div class="flex-shrink-0">
                            <div class="flex items-center justify-center h-12 w-12 rounded-full bg-green-500 text-2xl">
                                ✓
                            </div>
                        </div>
                        <div class="ml-4">
                            <h4 class="text-xl font-bold text-gray-900 mb-2">Tersedia Sekarang untuk Semua User!</h4>
                            <p class="text-gray-700 leading-relaxed">
                                Semua fitur premium ini sudah aktif dan siap digunakan. Login ke dashboard Anda dan eksplorasi fitur-fitur baru yang akan mengubah cara kerja tim audit Anda. Butuh panduan? Tim support kami siap membantu 24/7.
                            </p>
                            <div class="mt-4">
                                <span class="inline-flex items-center px-4 py-2 rounded-lg bg-green-600 font-semibold hover:bg-green-700 transition-colors cursor-pointer">
                                    🚀 Mulai Sekarang
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                ',
                'status' => 'published',
                'published_at' => now()->subDays(2),
            ],
            [
                'title' => '10 Best Practices Audit Management: Panduan Lengkap untuk Tim Profesional',
                'excerpt' => 'Pelajari 10 praktik terbaik yang telah terbukti meningkatkan efektivitas audit hingga 180%. Dari perencanaan strategis hingga reporting excellence, panduan komprehensif ini akan mengubah cara tim Anda mengelola proyek audit dengan hasil yang terukur dan konsisten.',
                'content' => '
                <div class="mb-8">
                    <div class="relative overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-8">
                        <div class="relative z-10">
                            <div class="flex items-center space-x-3 mb-4">
                                <span class="px-4 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-bold">
                                    📚 BEST PRACTICES
                                </span>
                                <span class="px-4 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-bold">
                                    ⭐ EXPERT GUIDE
                                </span>
                            </div>
                            <h2 class="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4">Master the Art of Audit Management</h2>
                            <p class="text-lg md:text-xl opacity-90 max-w-3xl leading-relaxed">
                                Berdasarkan riset mendalam dan pengalaman 1000+ successful audit projects, kami merangkum 10 best practices yang wajib dikuasai setiap audit professional. Implementasi panduan ini terbukti meningkatkan success rate hingga 95%.
                            </p>
                        </div>
                        <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                        <div class="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"></div>
                    </div>
                </div>

                <div class="bg-amber-50 border-l-4 border-amber-500 rounded-r-xl p-6 mb-8">
                    <div class="flex items-start">
                        <span class="text-3xl mr-4">💡</span>
                        <div>
                            <h4 class="text-lg font-bold text-gray-900 mb-2">Quick Stats</h4>
                            <p class="text-gray-700">
                                Tim yang menerapkan best practices ini melaporkan <strong class="text-amber-700">80% pengurangan</strong> dalam audit delays, 
                                <strong class="text-amber-700">65% peningkatan</strong> client satisfaction, dan 
                                <strong class="text-amber-700">40% efisiensi biaya</strong> operasional.
                            </p>
                        </div>
                    </div>
                </div>

                <div class="space-y-6 mb-8">
                    <div class="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border-t-4 border-blue-500 overflow-hidden">
                        <div class="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4">
                            <div class="flex items-center justify-between">
                                <h3 class="text-2xl font-bold flex items-center">
                                    <span class="bg-white text-blue-600 rounded-full w-10 h-10 flex items-center justify-center mr-4 font-extrabold">1</span>
                                    Perencanaan Strategis yang Matang
                                </h3>
                                <span class="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold">CRITICAL</span>
                            </div>
                        </div>
                        <div class="p-6">
                            <p class="text-gray-700 mb-4 leading-relaxed text-lg">
                                Audit yang sukses dimulai dengan perencanaan yang detail dan terstruktur. Identifikasi scope, objectives, timeline, resources, dan potential risks sebelum execution dimulai.
                            </p>
                            <div class="bg-blue-50 rounded-lg p-4 mb-4">
                                <h5 class="font-bold text-gray-900 mb-3 flex items-center">
                                    <svg class="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                                    </svg>
                                    Key Planning Elements:
                                </h5>
                                <ul class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <li class="flex items-start">
                                        <span class="text-blue-600 mr-2 font-bold">✦</span>
                                        <span class="text-gray-700">Define clear audit objectives & deliverables</span>
                                    </li>
                                    <li class="flex items-start">
                                        <span class="text-blue-600 mr-2 font-bold">✦</span>
                                        <span class="text-gray-700">Create detailed project timeline with milestones</span>
                                    </li>
                                    <li class="flex items-start">
                                        <span class="text-blue-600 mr-2 font-bold">✦</span>
                                        <span class="text-gray-700">Allocate resources & assign responsibilities</span>
                                    </li>
                                    <li class="flex items-start">
                                        <span class="text-blue-600 mr-2 font-bold">✦</span>
                                        <span class="text-gray-700">Conduct risk assessment & mitigation planning</span>
                                    </li>
                                </ul>
                            </div>
                            <div class="flex items-center justify-between pt-4 border-t border-gray-200">
                                <span class="text-sm text-gray-600 font-semibold">💡 AURA Tip:</span>
                                <span class="text-sm text-gray-700">Gunakan Project Template untuk mempercepat planning phase</span>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border-t-4 border-emerald-500 overflow-hidden">
                        <div class="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4">
                            <div class="flex items-center justify-between">
                                <h3 class="text-2xl font-bold flex items-center">
                                    <span class="bg-white text-emerald-600 rounded-full w-10 h-10 flex items-center justify-center mr-4 font-extrabold">2</span>
                                    Komunikasi Efektif & Kolaborasi Tim
                                </h3>
                                <span class="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold">HIGH PRIORITY</span>
                            </div>
                        </div>
                        <div class="p-6">
                            <p class="text-gray-700 mb-4 leading-relaxed text-lg">
                                Pastikan semua stakeholder memahami peran, tanggung jawab, dan ekspektasi mereka. Komunikasi yang transparan mengurangi miscommunication hingga 85%.
                            </p>
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div class="bg-emerald-50 rounded-lg p-4 text-center">
                                    <div class="text-3xl font-bold text-emerald-600 mb-1">85%</div>
                                    <div class="text-sm text-gray-600">Reduced Miscommunication</div>
                                </div>
                                <div class="bg-teal-50 rounded-lg p-4 text-center">
                                    <div class="text-3xl font-bold text-teal-600 mb-1">3x</div>
                                    <div class="text-sm text-gray-600">Faster Issue Resolution</div>
                                </div>
                                <div class="bg-cyan-50 rounded-lg p-4 text-center">
                                    <div class="text-3xl font-bold text-cyan-600 mb-1">92%</div>
                                    <div class="text-sm text-gray-600">Team Satisfaction</div>
                                </div>
                            </div>
                            <div class="bg-gradient-to-r from-emerald-100 to-teal-100 rounded-lg p-4">
                                <p class="text-gray-800 font-semibold mb-2">🔧 Best Communication Tools in AURA:</p>
                                <div class="flex flex-wrap gap-2">
                                    <span class="px-3 py-1 bg-white rounded-full text-xs font-medium text-gray-700 shadow-sm">Real-time Comments</span>
                                    <span class="px-3 py-1 bg-white rounded-full text-xs font-medium text-gray-700 shadow-sm">Task Mentions @</span>
                                    <span class="px-3 py-1 bg-white rounded-full text-xs font-medium text-gray-700 shadow-sm">Team Chat</span>
                                    <span class="px-3 py-1 bg-white rounded-full text-xs font-medium text-gray-700 shadow-sm">Email Notifications</span>
                                    <span class="px-3 py-1 bg-white rounded-full text-xs font-medium text-gray-700 shadow-sm">Video Conferencing</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border-t-4 border-purple-500 overflow-hidden">
                        <div class="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4">
                            <h3 class="text-2xl font-bold flex items-center">
                                <span class="bg-white text-purple-600 rounded-full w-10 h-10 flex items-center justify-center mr-4 font-extrabold">3</span>
                                Dokumentasi Komprehensif & Terstruktur
                            </h3>
                        </div>
                        <div class="p-6">
                            <p class="text-gray-700 mb-4 leading-relaxed text-lg">
                                Dokumentasi yang lengkap adalah backbone dari audit yang berkualitas. Setiap finding, evidence, dan decision harus tercatat dengan baik untuk audit trail yang solid.
                            </p>
                            <div class="border-l-4 border-purple-500 bg-purple-50 rounded-r-lg p-4 mb-4">
                                <p class="text-gray-800 font-semibold mb-2">📁 Documentation Checklist:</p>
                                <div class="space-y-2">
                                    <div class="flex items-center">
                                        <input type="checkbox" checked disabled class="mr-3 h-5 w-5 text-purple-600 rounded">
                                        <span class="text-gray-700">Audit plan & methodology documents</span>
                                    </div>
                                    <div class="flex items-center">
                                        <input type="checkbox" checked disabled class="mr-3 h-5 w-5 text-purple-600 rounded">
                                        <span class="text-gray-700">Working papers & evidence collection</span>
                                    </div>
                                    <div class="flex items-center">
                                        <input type="checkbox" checked disabled class="mr-3 h-5 w-5 text-purple-600 rounded">
                                        <span class="text-gray-700">Meeting minutes & communication logs</span>
                                    </div>
                                    <div class="flex items-center">
                                        <input type="checkbox" checked disabled class="mr-3 h-5 w-5 text-purple-600 rounded">
                                        <span class="text-gray-700">Findings register & remediation tracking</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border-t-4 border-orange-500 overflow-hidden">
                        <div class="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4">
                            <h3 class="text-2xl font-bold flex items-center">
                                <span class="bg-white text-orange-600 rounded-full w-10 h-10 flex items-center justify-center mr-4 font-extrabold">4</span>
                                Review Berkala & Progress Monitoring
                            </h3>
                        </div>
                        <div class="p-6">
                            <p class="text-gray-700 mb-4 leading-relaxed text-lg">
                                Lakukan checkpoint reviews secara berkala untuk memastikan audit berjalan on-track. Early detection of issues dapat menghemat 40% rework time.
                            </p>
                            <div class="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-4">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <h5 class="font-bold text-gray-900 mb-3">🔍 Weekly Reviews:</h5>
                                        <ul class="space-y-1 text-sm text-gray-700">
                                            <li>• Task completion status</li>
                                            <li>• Resource utilization</li>
                                            <li>• Blocker identification</li>
                                            <li>• Timeline adjustments</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h5 class="font-bold text-gray-900 mb-3">📊 Monthly Reviews:</h5>
                                        <ul class="space-y-1 text-sm text-gray-700">
                                            <li>• Overall project health</li>
                                            <li>• Budget vs actual analysis</li>
                                            <li>• Quality assurance checks</li>
                                            <li>• Stakeholder alignment</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border-t-4 border-indigo-500 overflow-hidden">
                        <div class="bg-gradient-to-r from-indigo-500 to-blue-500 px-6 py-4">
                            <h3 class="text-2xl font-bold flex items-center">
                                <span class="bg-white text-indigo-600 rounded-full w-10 h-10 flex items-center justify-center mr-4 font-extrabold">5</span>
                                Template Standardization untuk Konsistensi
                            </h3>
                        </div>
                        <div class="p-6">
                            <p class="text-gray-700 mb-4 leading-relaxed text-lg">
                                Manfaatkan template untuk menghemat waktu setup dan memastikan konsistensi quality across all projects. Template library AURA menyediakan 50+ ready-to-use templates.
                            </p>
                            <div class="flex items-center justify-between bg-indigo-50 rounded-lg p-4">
                                <div class="flex items-center">
                                    <span class="text-4xl mr-4">⚡</span>
                                    <div>
                                        <p class="font-bold text-gray-900">Hemat hingga 8 jam per project</p>
                                        <p class="text-sm text-gray-600">dengan template automation</p>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <p class="text-3xl font-bold text-indigo-600">75%</p>
                                    <p class="text-xs text-gray-600">Time Saved</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    <div class="bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl p-6">
                        <div class="text-4xl mb-3">🎯</div>
                        <h4 class="text-xl font-bold mb-2">6. Quality Assurance</h4>
                        <p class="text-sm opacity-90">Implement peer reviews dan quality gates di setiap phase untuk maintain high standards.</p>
                    </div>
                    <div class="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-6">
                        <div class="text-4xl mb-3">🔐</div>
                        <h4 class="text-xl font-bold mb-2">7. Data Security</h4>
                        <p class="text-sm opacity-90">Protect sensitive audit data dengan encryption, access controls, dan secure backup strategies.</p>
                    </div>
                    <div class="bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl p-6">
                        <div class="text-4xl mb-3">📈</div>
                        <h4 class="text-xl font-bold mb-2">8. Continuous Learning</h4>
                        <p class="text-sm opacity-90">Conduct post-audit retrospectives untuk identify lessons learned dan improvement areas.</p>
                    </div>
                    <div class="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl p-6">
                        <div class="text-4xl mb-3">🤝</div>
                        <h4 class="text-xl font-bold mb-2">9. Client Engagement</h4>
                        <p class="text-sm opacity-90">Maintain transparent communication dengan klien melalui regular updates dan interactive portals.</p>
                    </div>
                    <div class="bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl p-6">
                        <div class="text-4xl mb-3">⚙️</div>
                        <h4 class="text-xl font-bold mb-2">10. Tech Leverage</h4>
                        <p class="text-sm opacity-90">Maximize productivity dengan memanfaatkan automation, AI insights, dan modern audit tools.</p>
                    </div>
                    <div class="bg-gradient-to-br from-red-500 to-pink-500 rounded-xl p-6">
                        <div class="text-4xl mb-3">📋</div>
                        <h4 class="text-xl font-bold mb-2">Bonus: Reporting</h4>
                        <p class="text-sm opacity-90">Create clear, actionable reports dengan visual data presentation dan executive summaries.</p>
                    </div>
                </div>

                <div class="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-center mb-8">
                    <h3 class="text-2xl md:text-3xl font-bold mb-4">🏆 Hasil yang Bisa Anda Capai</h3>
                    <p class="text-base md:text-lg mb-6 opacity-90">Dengan menerapkan 10 best practices ini secara konsisten:</p>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div class="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                            <div class="text-4xl font-extrabold mb-1">95%</div>
                            <div class="text-sm">Success Rate</div>
                        </div>
                        <div class="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                            <div class="text-4xl font-extrabold mb-1">180%</div>
                            <div class="text-sm">ROI Increase</div>
                        </div>
                        <div class="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                            <div class="text-4xl font-extrabold mb-1">70%</div>
                            <div class="text-sm">Time Efficiency</div>
                        </div>
                        <div class="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                            <div class="text-4xl font-extrabold mb-1">4.8/5</div>
                            <div class="text-sm">Client Rating</div>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-xl shadow-xl border-2 border-indigo-200 p-8">
                    <div class="flex items-start">
                        <div class="flex-shrink-0">
                            <div class="flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-3xl">
                                💪
                            </div>
                        </div>
                        <div class="ml-6 flex-1">   
                            <h4 class="text-2xl font-bold text-gray-900 mb-3">Siap Menjadi Audit Professional Terbaik?</h4>
                            <p class="text-gray-700 leading-relaxed mb-4">
                                Implementasikan best practices ini di project Anda berikutnya dan rasakan perbedaannya. AURA menyediakan semua tools dan features yang Anda butuhkan untuk menerapkan 10 best practices ini dengan mudah.
                            </p>
                            <div class="flex flex-wrap gap-3">
                                <span class="inline-flex items-center px-5 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 font-bold hover:from-indigo-700 hover:to-purple-700 transition-all cursor-pointer shadow-lg">
                                    📚 Download PDF Guide
                                </span>
                                <span class="inline-flex items-center px-5 py-2 rounded-lg border-2 border-indigo-600 text-indigo-600 font-bold hover:bg-indigo-50 transition-all cursor-pointer">
                                    🎓 Join Training Session
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                ',
                'status' => 'published',
                'published_at' => now()->subDays(5),
            ],
            [
                'title' => 'Transformasi Digital Audit 2025: Case Study & Success Stories dari Leading Companies',
                'excerpt' => 'Bagaimana 50+ perusahaan terkemuka meningkatkan efisiensi audit hingga 400% dengan AURA? Eksplorasi case studies mendalam, real numbers, dan testimoni langsung dari C-level executives yang telah merasakan dampak transformasi digital dalam audit management mereka.',
                'content' => '
                <div class="relative mb-8">
                    <div class="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl opacity-75"></div>
                    <div class="relative bg-white/95 backdrop-blur-sm rounded-2xl p-8 m-1">
                        <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
                            <div class="flex items-center space-x-3">
                                <span class="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full text-sm font-bold shadow-lg">
                                    ✅ VERIFIED RESULTS
                                </span>
                                <span class="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full text-sm font-bold shadow-lg">
                                    📊 REAL DATA
                                </span>
                            </div>
                            <span class="text-gray-600 font-semibold text-sm">Updated: December 2025</span>
                        </div>
                        <h2 class="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
                            Success Stories:<br/>
                            <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                                When Digital Meets Excellence
                            </span>
                        </h2>
                        <p class="text-xl text-gray-700 leading-relaxed max-w-4xl">
                            Dari startup hingga Fortune 500 companies, discover bagaimana AURA membantu transformasi audit management dengan hasil yang terukur dan sustainable. Real stories, real impact, real transformation.
                        </p>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-center shadow-xl hover:shadow-2xl transition-shadow">
                        <div class="text-5xl font-extrabold mb-2">50+</div>
                        <div class="text-lg font-semibold mb-1">Companies</div>
                        <div class="text-sm text-blue-100">Successfully Transformed</div>
                    </div>
                    <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-center shadow-xl hover:shadow-2xl transition-shadow">
                        <div class="text-5xl font-extrabold mb-2">$2.5M</div>
                        <div class="text-lg font-semibold mb-1">Cost Savings</div>
                        <div class="text-sm text-purple-100">Average Annual Savings</div>
                    </div>
                    <div class="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-6 text-center shadow-xl hover:shadow-2xl transition-shadow">
                        <div class="text-5xl font-extrabold mb-2">400%</div>
                        <div class="text-lg font-semibold mb-1">ROI Growth</div>
                        <div class="text-sm text-pink-100">Within First Year</div>
                    </div>
                </div>

                <div class="mb-8">
                    <h3 class="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                        <span class="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg px-4 py-2 mr-3">
                            📋 Case Studies
                        </span>
                    </h3>

                    <div class="space-y-6">
                        <div class="bg-white rounded-2xl shadow-xl overflow-hidden border-l-8 border-blue-500 hover:shadow-2xl transition-all">
                            <div class="p-8">
                                <div class="flex items-start justify-between mb-4">
                                    <div class="flex items-center">
                                        <div class="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center text-2xl font-bold mr-4">
                                            PT
                                        </div>
                                        <div>
                                            <h4 class="text-2xl font-bold text-gray-900">PT Global Finance Indonesia</h4>
                                            <p class="text-gray-600 font-semibold">Financial Services • 2,500+ Employees</p>
                                        </div>
                                    </div>
                                    <span class="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-bold">Banking Sector</span>
                                </div>
                                
                                <div class="bg-blue-50 rounded-xl p-6 mb-6">
                                    <h5 class="text-lg font-bold text-gray-900 mb-3">🎯 Challenge:</h5>
                                    <p class="text-gray-700 leading-relaxed">
                                        Managing 150+ concurrent audit projects across 30 branch offices dengan traditional spreadsheet-based system. Audit delays mencapai 45%, client complaints meningkat 60%, dan operational cost membengkak.
                                    </p>
                                </div>

                                <div class="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl p-6 mb-6">
                                    <h5 class="text-lg font-bold mb-3">💡 Solution with AURA:</h5>
                                    <ul class="space-y-2">
                                        <li class="flex items-start">
                                            <svg class="w-6 h-6 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                                            </svg>
                                            Centralized audit management dashboard untuk semua branch offices
                                        </li>
                                        <li class="flex items-start">
                                            <svg class="w-6 h-6 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                                            </svg>
                                            Automated workflow & task assignment dengan AI-powered optimization
                                        </li>
                                        <li class="flex items-start">
                                            <svg class="w-6 h-6 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                                            </svg>
                                            Real-time collaboration tools untuk 200+ auditors
                                        </li>
                                        <li class="flex items-start">
                                            <svg class="w-6 h-6 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                                            </svg>
                                            Client portal untuk transparent progress tracking
                                        </li>
                                    </ul>
                                </div>

                                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                    <div class="bg-green-50 rounded-lg p-4 border-2 border-green-200">
                                        <div class="text-3xl font-bold text-green-600 mb-1">78%</div>
                                        <div class="text-xs text-gray-600 font-semibold">Reduced Delays</div>
                                    </div>
                                    <div class="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                                        <div class="text-3xl font-bold text-blue-600 mb-1">$1.2M</div>
                                        <div class="text-xs text-gray-600 font-semibold">Annual Savings</div>
                                    </div>
                                    <div class="bg-purple-50 rounded-lg p-4 border-2 border-purple-200">
                                        <div class="text-3xl font-bold text-purple-600 mb-1">92%</div>
                                        <div class="text-xs text-gray-600 font-semibold">Client Satisfaction</div>
                                    </div>
                                    <div class="bg-orange-50 rounded-lg p-4 border-2 border-orange-200">
                                        <div class="text-3xl font-bold text-orange-600 mb-1">6 Months</div>
                                        <div class="text-xs text-gray-600 font-semibold">Full ROI</div>
                                    </div>
                                </div>

                                <div class="bg-gray-50 rounded-xl p-6 border-l-4 border-blue-500">
                                    <div class="flex items-start">
                                        <div class="text-4xl mr-4">💬</div>
                                        <div>
                                            <p class="text-gray-700 italic leading-relaxed mb-2">
                                                "AURA mengubah total cara kami melakukan audit. Yang tadinya butuh 3 bulan, sekarang selesai dalam 5 minggu dengan kualitas lebih baik. Tim kami lebih produktif dan clients jauh lebih happy."
                                            </p>
                                            <p class="text-gray-900 font-bold">— Budi Santoso, Head of Internal Audit</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="bg-white rounded-2xl shadow-xl overflow-hidden border-l-8 border-emerald-500 hover:shadow-2xl transition-all">
                            <div class="p-8">
                                <div class="flex items-start justify-between mb-4">
                                    <div class="flex items-center">
                                        <div class="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl flex items-center justify-center text-2xl font-bold mr-4">
                                            CV
                                        </div>
                                        <div>
                                            <h4 class="text-2xl font-bold text-gray-900">CV Sejahtera Manufacturing</h4>
                                            <p class="text-gray-600 font-semibold">Manufacturing • 800+ Employees</p>
                                        </div>
                                    </div>
                                    <span class="px-4 py-2 bg-emerald-100 text-emerald-800 rounded-full text-sm font-bold">Manufacturing</span>
                                </div>
                                
                                <div class="bg-emerald-50 rounded-xl p-6 mb-6">
                                    <h5 class="text-lg font-bold text-gray-900 mb-3">🎯 Challenge:</h5>
                                    <p class="text-gray-700 leading-relaxed">
                                        Startup manufacturing dengan rapid growth menghadapi kompleksitas audit operational yang meningkat 300% dalam 2 tahun. Paper-based documentation menyebabkan data loss 25% dan compliance issues.
                                    </p>
                                </div>

                                <div class="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-6 mb-6">
                                    <h5 class="text-lg font-bold mb-3">💡 AURA Implementation:</h5>
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                                            <div class="font-bold mb-2">Phase 1: Foundation</div>
                                            <ul class="text-sm space-y-1">
                                                <li>• Digital documentation system</li>
                                                <li>• User onboarding & training</li>
                                                <li>• Data migration from paper</li>
                                            </ul>
                                        </div>
                                        <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                                            <div class="font-bold mb-2">Phase 2: Optimization</div>
                                            <ul class="text-sm space-y-1">
                                                <li>• Workflow automation</li>
                                                <li>• Template standardization</li>
                                                <li>• Analytics dashboard</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                    <div class="bg-emerald-50 rounded-lg p-4 border-2 border-emerald-200">
                                        <div class="text-3xl font-bold text-emerald-600 mb-1">95%</div>
                                        <div class="text-xs text-gray-600 font-semibold">Data Accuracy</div>
                                    </div>
                                    <div class="bg-teal-50 rounded-lg p-4 border-2 border-teal-200">
                                        <div class="text-3xl font-bold text-teal-600 mb-1">$450K</div>
                                        <div class="text-xs text-gray-600 font-semibold">Cost Reduction</div>
                                    </div>
                                    <div class="bg-cyan-50 rounded-lg p-4 border-2 border-cyan-200">
                                        <div class="text-3xl font-bold text-cyan-600 mb-1">Zero</div>
                                        <div class="text-xs text-gray-600 font-semibold">Compliance Issues</div>
                                    </div>
                                    <div class="bg-green-50 rounded-lg p-4 border-2 border-green-200">
                                        <div class="text-3xl font-bold text-green-600 mb-1">4x</div>
                                        <div class="text-xs text-gray-600 font-semibold">Faster Processing</div>
                                    </div>
                                </div>

                                <div class="bg-gray-50 rounded-xl p-6 border-l-4 border-emerald-500">
                                    <div class="flex items-start">
                                        <div class="text-4xl mr-4">💬</div>
                                        <div>
                                            <p class="text-gray-700 italic leading-relaxed mb-2">
                                                "Sebagai startup yang berkembang pesat, kami butuh solution yang scalable. AURA tidak hanya solve masalah kami hari ini, tapi juga prepare kami untuk growth di masa depan. Best investment ever!"
                                            </p>
                                            <p class="text-gray-900 font-bold">— Sarah Wijaya, Operations Director</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="bg-white rounded-2xl shadow-xl overflow-hidden border-l-8 border-purple-500 hover:shadow-2xl transition-all">
                            <div class="p-8">
                                <div class="flex items-start justify-between mb-4">
                                    <div class="flex items-center">
                                        <div class="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-600 rounded-xl flex items-center justify-center text-2xl font-bold mr-4">
                                            LP
                                        </div>
                                        <div>
                                            <h4 class="text-2xl font-bold text-gray-900">Lembaga Pendidikan Nusantara</h4>
                                            <p class="text-gray-600 font-semibold">Education • 5,000+ Students</p>
                                        </div>
                                    </div>
                                    <span class="px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-bold">Education</span>
                                </div>
                                
                                <div class="bg-purple-50 rounded-xl p-6 mb-6">
                                    <h5 class="text-lg font-bold text-gray-900 mb-3">🎯 Challenge:</h5>
                                    <p class="text-gray-700 leading-relaxed">
                                        Multi-campus educational institution dengan 15 locations struggling dengan inconsistent audit standards, lack of visibility, dan manual reporting yang memakan 200+ man-hours per month.
                                    </p>
                                </div>

                                <div class="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 mb-4">
                                    <h5 class="text-lg font-bold mb-3">💡 Transformation Journey:</h5>
                                    <div class="space-y-3">
                                        <div class="flex items-center">
                                            <div class="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold mr-3">1</div>
                                            <span>Standardized audit templates across all campuses</span>
                                        </div>
                                        <div class="flex items-center">
                                            <div class="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold mr-3">2</div>
                                            <span>Real-time monitoring dashboard untuk central office</span>
                                        </div>
                                        <div class="flex items-center">
                                            <div class="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold mr-3">3</div>
                                            <span>Automated report generation & distribution</span>
                                        </div>
                                    </div>
                                </div>

                                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                    <div class="bg-purple-50 rounded-lg p-4 border-2 border-purple-200">
                                        <div class="text-3xl font-bold text-purple-600 mb-1">85%</div>
                                        <div class="text-xs text-gray-600 font-semibold">Time Savings</div>
                                    </div>
                                    <div class="bg-pink-50 rounded-lg p-4 border-2 border-pink-200">
                                        <div class="text-3xl font-bold text-pink-600 mb-1">100%</div>
                                        <div class="text-xs text-gray-600 font-semibold">Consistency</div>
                                    </div>
                                    <div class="bg-indigo-50 rounded-lg p-4 border-2 border-indigo-200">
                                        <div class="text-3xl font-bold text-indigo-600 mb-1">15</div>
                                        <div class="text-xs text-gray-600 font-semibold">Campuses United</div>
                                    </div>
                                    <div class="bg-fuchsia-50 rounded-lg p-4 border-2 border-fuchsia-200">
                                        <div class="text-3xl font-bold text-fuchsia-600 mb-1">$200K</div>
                                        <div class="text-xs text-gray-600 font-semibold">Annual Savings</div>
                                    </div>
                                </div>

                                <div class="bg-gray-50 rounded-xl p-6 border-l-4 border-purple-500">
                                    <div class="flex items-start">
                                        <div class="text-4xl mr-4">💬</div>
                                        <div>
                                            <p class="text-gray-700 italic leading-relaxed mb-2">
                                                "Koordinasi audit lintas 15 kampus dulu seperti mimpi buruk. Dengan AURA, semua jadi transparent dan synchronized. Board of directors impressed dengan improvement yang kami capai!"
                                            </p>
                                            <p class="text-gray-900 font-bold">— Dr. Ahmad Rahman, Head of Quality Assurance</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400 rounded-2xl p-8 mb-8">
                    <h3 class="text-3xl font-bold mb-6 text-center">📊 Aggregate Impact Across All Clients</h3>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div class="text-center">
                            <div class="text-5xl font-extrabold mb-2">8,500+</div>
                            <div class="text-lg font-semibold">Projects Completed</div>
                        </div>
                        <div class="text-center">
                            <div class="text-5xl font-extrabold mb-2">$12M+</div>
                            <div class="text-lg font-semibold">Total Cost Savings</div>
                        </div>
                        <div class="text-center">
                            <div class="text-5xl font-extrabold mb-2">98.5%</div>
                            <div class="text-lg font-semibold">User Satisfaction</div>
                        </div>
                        <div class="text-center">
                            <div class="text-5xl font-extrabold mb-2">24/7</div>
                            <div class="text-lg font-semibold">Support Available</div>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div class="bg-white rounded-xl shadow-lg p-6 border-t-4 border-cyan-500">
                        <h4 class="text-xl font-bold text-gray-900 mb-4 flex items-center">
                            <span class="text-3xl mr-3">🏆</span>
                            Industry Recognition
                        </h4>
                        <ul class="space-y-2 text-gray-700">
                            <li class="flex items-start">
                                <span class="text-yellow-500 mr-2">⭐</span>
                                <span>Best Audit Management Platform 2025 - Tech Awards Indonesia</span>
                            </li>
                            <li class="flex items-start">
                                <span class="text-yellow-500 mr-2">⭐</span>
                                <span>Top 10 SaaS Solutions for Finance - IDN Magazine</span>
                            </li>
                            <li class="flex items-start">
                                <span class="text-yellow-500 mr-2">⭐</span>
                                <span>Innovation Excellence Award - Digital Transformation Summit</span>
                            </li>
                        </ul>
                    </div>

                    <div class="bg-white rounded-xl shadow-lg p-6 border-t-4 border-indigo-500">
                        <h4 class="text-xl font-bold text-gray-900 mb-4 flex items-center">
                            <span class="text-3xl mr-3">🎓</span>
                            Training & Certification
                        </h4>
                        <p class="text-gray-700 mb-4">
                            Semua clients mendapat akses ke comprehensive training program dan certification:
                        </p>
                        <div class="flex flex-wrap gap-2">
                            <span class="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">Basic Training</span>
                            <span class="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">Advanced Features</span>
                            <span class="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-medium">Admin Certification</span>
                            <span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">Best Practices</span>
                        </div>
                    </div>
                </div>

                <div class="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-2xl p-8 text-center">
                    <h3 class="text-2xl md:text-3xl font-bold mb-4">🚀 Ready to Write Your Success Story?</h3>
                    <p class="text-lg md:text-xl mb-6 opacity-90 max-w-3xl mx-auto">
                        Join 50+ leading companies yang telah transform audit management mereka. Dapatkan free consultation dan custom demo untuk bisnis Anda.
                    </p>
                    <div class="flex flex-wrap gap-4 justify-center">
                        <button class="px-8 py-4 bg-white text-green-600 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl">
                            📞 Schedule Free Consultation
                        </button>
                        <button class="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white rounded-xl font-bold text-lg hover:bg-white/20 transition-all">
                            📥 Download Case Study PDF
                        </button>
                    </div>
                    <p class="text-sm opacity-80 mt-6">
                        ✅ No credit card required • ✅ 30-day free trial • ✅ Money-back guarantee
                    </p>
                </div>
                ',
                'status' => 'published',
                'published_at' => now()->subDays(7),
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

