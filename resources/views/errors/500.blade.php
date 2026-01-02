<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>500 - Server Error</title>
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
    </style>
</head>
<body class="bg-gradient-to-br from-orange-50 via-white to-orange-50 min-h-screen flex items-center justify-center px-4">
    <div class="max-w-2xl w-full">
        <!-- Logo/Brand -->
        <div class="text-center mb-8">
            <div class="inline-flex items-center gap-3 mb-4">
                <img src="/logo1x1.png" alt="AHR TRACK Logo" class="h-12 w-12">
                <div class="text-left">
                    <h1 class="text-2xl font-bold text-primary-600">AHR TRACK</h1>
                    <p class="text-xs text-gray-500">Audit, Reporting & Analyze</p>
                </div>
            </div>
        </div>

        <!-- Error Content -->
        <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div class="p-8 sm:p-12 text-center">
                <!-- 500 Number -->
                <div class="mb-6 animate-float">
                    <div class="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full mb-4">
                        <svg class="w-16 h-16 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h1 class="text-7xl sm:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-orange-400">
                        500
                    </h1>
                </div>

                <!-- Error Message -->
                <h2 class="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
                    Terjadi Kesalahan Server
                </h2>
                <p class="text-gray-600 mb-8 max-w-md mx-auto">
                    Maaf, terjadi kesalahan di server kami. Tim teknis kami telah diberitahu dan sedang memperbaiki masalah ini.
                </p>

                <!-- Action Buttons -->
                <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <a href="{{ url('/') }}" class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-medium rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-lg hover:shadow-xl">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Kembali ke Beranda
                    </a>
                    <button onclick="location.reload()" class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-all duration-200">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Coba Lagi
                    </button>
                </div>
            </div>

            <!-- Decorative Footer -->
            <div class="bg-gradient-to-r from-orange-50 to-orange-100 px-8 py-4 border-t border-orange-200">
                <div class="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600">
                    <div class="flex items-center gap-2">
                        <svg class="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Butuh bantuan?</span>
                    </div>
                    <a href="mailto:abdulhamidkap@gmail.com" class="text-orange-600 hover:text-orange-700 font-medium hover:underline">
                        Hubungi Tim Support
                    </a>
                </div>
            </div>
        </div>

        <!-- Additional Info -->
        <div class="mt-6 text-center text-sm text-gray-500">
            <p>Error Code: 500 | {{ now()->format('Y-m-d H:i:s') }}</p>
        </div>
    </div>
</body>
</html>
