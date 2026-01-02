<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>503 - Dalam Pemeliharaan</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: {
                            50: '#f0fdf4',
                            100: '#dcfce7',
                            200: '#bbf7d0',
                            300: '#86efac',
                            400: '#4ade80',
                            500: '#46B860',
                            600: '#16a34a',
                            700: '#15803d',
                            800: '#166534',
                            900: '#14532d',
                        }
                    }
                }
            }
        }
    </script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Figtree:wght@300;400;500;600;700;800&display=swap');
        body {
            font-family: 'Figtree', sans-serif;
        }
        .animate-float {
            animation: float 3s ease-in-out infinite;
        }
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
        }
        .animate-spin-slow {
            animation: spin 3s linear infinite;
        }
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
    </style>
</head>
<body class="bg-gradient-to-br from-purple-50 via-white to-purple-50 min-h-screen flex items-center justify-center px-4">
    <div class="max-w-2xl w-full">
        <!-- Logo/Brand -->
        <div class="text-center mb-8">
            <div class="inline-flex items-center gap-3 mb-4">
                <img src="/logo1x1.png" alt="AURA Logo" class="h-12 w-12">
                <div class="text-left">
                    <h1 class="text-2xl font-bold text-primary-600">AURA</h1>
                    <p class="text-xs text-gray-500">Audit, Reporting & Analyze</p>
                </div>
            </div>
        </div>

        <!-- Error Content -->
        <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div class="p-8 sm:p-12 text-center">
                <!-- 503 Number -->
                <div class="mb-6 animate-float">
                    <div class="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full mb-4">
                        <svg class="w-16 h-16 text-purple-600 animate-spin-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <h1 class="text-7xl sm:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-400">
                        503
                    </h1>
                </div>

                <!-- Error Message -->
                <h2 class="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
                    Sistem Dalam Pemeliharaan
                </h2>
                <p class="text-gray-600 mb-8 max-w-md mx-auto">
                    Saat ini kami sedang melakukan pemeliharaan sistem untuk meningkatkan kualitas layanan. 
                    Mohon kembali lagi dalam beberapa saat.
                </p>

                <!-- Progress Indicator -->
                <div class="mb-8 max-w-md mx-auto">
                    <div class="bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div class="bg-gradient-to-r from-primary-600 to-primary-400 h-full rounded-full" style="width: 65%; animation: pulse 2s ease-in-out infinite;"></div>
                    </div>
                    <p class="text-sm text-gray-500 mt-2">Estimasi selesai dalam beberapa saat...</p>
                </div>

                <!-- Action Buttons -->
                <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <button onclick="location.reload()" class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-medium rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-lg hover:shadow-xl">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Coba Lagi
                    </button>
                </div>
            </div>

            <!-- Decorative Footer -->
            <div class="bg-gradient-to-r from-purple-50 to-purple-100 px-8 py-4 border-t border-purple-200">
                <div class="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600">
                    <div class="flex items-center gap-2">
                        <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Butuh bantuan?</span>
                    </div>
                    <a href="mailto:abdulhamidkap@gmail.com" class="text-purple-600 hover:text-purple-700 font-medium hover:underline">
                        Hubungi Tim Support
                    </a>
                </div>
            </div>
        </div>

        <!-- Additional Info -->
        <div class="mt-6 text-center text-sm text-gray-500">
            <p>Service Unavailable | {{ now()->format('Y-m-d H:i:s') }}</p>
        </div>
    </div>
</body>
</html>
