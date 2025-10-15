<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\KlienController;
use App\Http\Controllers\PartnerController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\StaffController;
use App\Http\Controllers\TemplateController;
use App\Http\Controllers\UserController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    $user = Auth::user();
    
    if (!$user->role) {
        return Inertia::render('Dashboard', [
            'error' => 'No role assigned. Please contact administrator.'
        ]);
    }
    
    switch ($user->role->name) {
        case 'admin':
            return redirect()->route('admin.dashboard');
        case 'partner':
            return redirect()->route('partner.dashboard');
        case 'staff':
            return redirect()->route('staff.dashboard');
        case 'klien':
            return redirect()->route('klien.dashboard');
        default:
            return Inertia::render('Dashboard', [
                'error' => 'Invalid role. Please contact administrator.'
            ]);
    }
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Admin Routes
Route::middleware(['auth', 'verified', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('dashboard');
    Route::resource('users', UserController::class);
});

// Template Routes (Admin only)
Route::middleware(['auth', 'verified', 'role:admin'])->group(function () {
    Route::get('/templates', [TemplateController::class, 'index'])->name('templates.index');
    Route::get('/templates/{template}/edit', [TemplateController::class, 'edit'])->name('templates.edit');
    Route::put('/templates/{template}', [TemplateController::class, 'update'])->name('templates.update');
});

// Partner Routes
Route::middleware(['auth', 'verified', 'role:partner'])->prefix('partner')->name('partner.')->group(function () {
    Route::get('/dashboard', [PartnerController::class, 'dashboard'])->name('dashboard');
});

// Staff Routes
Route::middleware(['auth', 'verified', 'role:staff'])->prefix('staff')->name('staff.')->group(function () {
    Route::get('/dashboard', [StaffController::class, 'dashboard'])->name('dashboard');
});

// Klien Routes
Route::middleware(['auth', 'verified', 'role:klien'])->prefix('klien')->name('klien.')->group(function () {
    Route::get('/dashboard', [KlienController::class, 'dashboard'])->name('dashboard');
});

require __DIR__.'/auth.php';
