import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function Welcome({
    auth,
}: PageProps) {
    return (
        <>
            <Head title="AURA - Audit, Reporting and Analyze" />
            <div className="bg-gradient-to-br from-primary-50 via-white to-primary-100 min-h-screen">
                {/* Header */}
                <header className="bg-white shadow-sm border-b border-primary-100">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-4">
                            <div className="flex items-center space-x-3">
                                <ApplicationLogo className="h-10 w-10" />
                                <div>
                                    <h1 className="text-2xl font-bold text-primary-600">AURA</h1>
                                    <p className="text-xs text-gray-500">Audit, Reporting & Analyze</p>
                                </div>
                            </div>
                            <nav className="flex items-center space-x-4">
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('login')}
                                            className="text-primary-600 hover:text-primary-700 px-4 py-2 rounded-lg font-medium transition-colors"
                                        >
                                            Masuk
                                        </Link>
                                        <Link
                                            href={route('register')}
                                            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                                        >
                                            Daftar
                                        </Link>
                                    </>
                                )}
                            </nav>
                        </div>
                    </div>
                </header>

                {/* Hero Section */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="text-center mb-16">
                        <div className="flex justify-center items-center mb-8">
                            <ApplicationLogo className="h-20 w-20 mr-6" />
                            <div>
                                <h1 className="text-5xl font-bold text-primary-600 mb-2">AURA</h1>
                                <p className="text-xl text-gray-600">Audit, Reporting and Analyze</p>
                            </div>
                        </div>
                        <h2 className="text-4xl font-bold text-gray-900 mb-6">
                            Sistem Manajemen Audit Profesional
                        </h2>
                        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                            Platform digital terintegrasi untuk mengelola seluruh proses audit dari perencanaan hingga pelaporan. 
                            Dikembangkan khusus untuk Kantor Akuntan Publik Abdul Hamid dan Rekan.
                        </p>
                        <div className="flex justify-center space-x-4">
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
                                >
                                    Masuk ke Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
                                    >
                                        Mulai Sekarang
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
                                    >
                                        Daftar Akun
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Features Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                        <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                            <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center mb-6">
                                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Audit Management</h3>
                            <p className="text-gray-600">
                                Kelola seluruh proses audit dari perencanaan, pelaksanaan, hingga penyelesaian dengan sistem yang terintegrasi dan efisien.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                            <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center mb-6">
                                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Advanced Reporting</h3>
                            <p className="text-gray-600">
                                Generate laporan audit yang komprehensif dan profesional dengan template yang dapat disesuaikan sesuai standar audit.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                            <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center mb-6">
                                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Real-time Analytics</h3>
                            <p className="text-gray-600">
                                Analisis mendalam terhadap data audit dengan dashboard interaktif dan visualisasi data yang informatif.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                            <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center mb-6">
                                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Team Collaboration</h3>
                            <p className="text-gray-600">
                                Kolaborasi tim audit yang efektif dengan pembagian role yang jelas: Admin, Partner, Staff, dan Klien.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                            <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center mb-6">
                                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Document Management</h3>
                            <p className="text-gray-600">
                                Sistem manajemen dokumen yang aman dan terorganisir untuk menyimpan semua dokumen audit dan kertas kerja.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                            <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center mb-6">
                                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Security & Compliance</h3>
                            <p className="text-gray-600">
                                Keamanan data tingkat enterprise dengan enkripsi dan compliance terhadap standar audit internasional.
                            </p>
                        </div>
                    </div>

                    {/* About Section */}
                    <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">
                            Kantor Akuntan Publik Abdul Hamid dan Rekan
                        </h2>
                        <p className="text-lg text-gray-600 mb-8 max-w-4xl mx-auto">
                            Dengan pengalaman puluhan tahun dalam bidang audit dan konsultasi keuangan, 
                            kami menghadirkan AURA sebagai solusi digital yang mengintegrasikan keahlian profesional 
                            dengan teknologi modern untuk memberikan layanan audit yang lebih efisien dan akurat.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div>
                                <div className="text-3xl font-bold text-primary-600 mb-2">15+</div>
                                <div className="text-gray-600">Tahun Pengalaman</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-primary-600 mb-2">500+</div>
                                <div className="text-gray-600">Klien Terpercaya</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-primary-600 mb-2">1000+</div>
                                <div className="text-gray-600">Audit Diselesaikan</div>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="bg-gray-900 text-white py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div>
                                <div className="flex items-center space-x-3 mb-4">
                                    <ApplicationLogo className="h-8 w-8" />
                                    <div>
                                        <h3 className="text-xl font-bold">AURA</h3>
                                        <p className="text-sm text-gray-400">Audit, Reporting & Analyze</p>
                                    </div>
                                </div>
                                <p className="text-gray-400">
                                    Platform audit digital profesional untuk Kantor Akuntan Publik Abdul Hamid dan Rekan.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-4">Kontak</h4>
                                <div className="space-y-2 text-gray-400">
                                    <p>Email: abdulhamidkap@gmail.com</p>
                                    <p>Telepon: (021) 7417874</p>
                                    <p>Jl. Ir. H. Juanda No. 50 Pondok Ranji Ciputat Tangerang, Pisangan, Kec. Ciputat Tim., Kota Tangerang Selatan, Banten 15419</p>
                                </div>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-4">Layanan</h4>
                                <div className="space-y-2 text-gray-400">
                                    <p>Audit Laporan Keuangan</p>
                                    <p>Konsultasi Pajak</p>
                                    <p>Jasa Akuntansi</p>
                                    <p>Manajemen Risiko</p>
                                </div>
                            </div>
                        </div>
                        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                            <p>&copy; 2025 Kantor Akuntan Publik Abdul Hamid dan Rekan. All rights reserved.</p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}