<?php

use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Client\ClientController;
use App\Http\Controllers\Admin\ClientController as AdminClientController;
use App\Http\Controllers\Admin\ProjectController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Company\StaffController;
use App\Http\Controllers\Admin\ProjectTemplateController;
use App\Http\Controllers\Admin\UserController;
use App\Models\WorkingSubStep;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Model binding for route parameters
Route::bind('projectKlien', function ($value) {
    return WorkingSubStep::findOrFail($value);
});

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

    // Check if role is string or object
    $roleName = is_string($user->role) ? $user->role : $user->role->name;

    switch ($roleName) {
        case 'admin':
            return redirect()->route('admin.dashboard');
        case 'partner':
            return redirect()->route('partner.dashboard');
        case 'staff':
            return redirect()->route('staff.dashboard');
        case 'klien':
        case 'client':
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

    // Client Management Routes  
    Route::resource('clients', AdminClientController::class);

    // Audit Management Routes
    Route::get('/project', [ProjectController::class, 'index'])->name('project.index');
    Route::get('/project/client/{client}', [ProjectController::class, 'show'])->name('project.show');
    Route::get('/project/client/{client}/manage', [ProjectController::class, 'manage'])->name('project.manage');
    Route::post('/project/client/{client}/generate', [ProjectController::class, 'generateFromProjectTemplate'])->name('project.generate');
    Route::get('/project-data/{projectKlien}/edit', [ProjectController::class, 'edit'])->name('project.edit');
    Route::put('/project-data/{projectKlien}', [ProjectController::class, 'update'])->name('project.update');
    
    // Project Working Steps Reorder
    Route::post('/project/working-steps/reorder', [ProjectController::class, 'reorderWorkingSteps'])->name('project.working-steps.reorder');
    Route::post('/project/working-sub-steps/reorder', [ProjectController::class, 'reorderWorkingSubSteps'])->name('project.working-sub-steps.reorder');
    
    Route::prefix('project-templates')->name('project-templates.')->group(function () {
        Route::get('/', [ProjectTemplateController::class, 'index'])->name('template-bundles.index');
        Route::get('/create', [ProjectTemplateController::class, 'createBundle'])->name('template-bundles.create');
        Route::post('/', [ProjectTemplateController::class, 'storeBundle'])->name('template-bundles.store');
        Route::get('/{templateBundle}', [ProjectTemplateController::class, 'showBundle'])->name('template-bundles.show');
        Route::get('/{templateBundle}/edit', [ProjectTemplateController::class, 'editBundle'])->name('template-bundles.edit');
        Route::put('/{templateBundle}', [ProjectTemplateController::class, 'updateBundle'])->name('template-bundles.update');
        Route::delete('/{templateBundle}', [ProjectTemplateController::class, 'destroyBundle'])->name('template-bundles.destroy');

        // Template Working Steps (using ProjectTemplateController)
        Route::post('template-working-steps', [ProjectTemplateController::class, 'storeWorkingStep'])->name('template-working-steps.store');
        Route::put('template-working-steps/{templateWorkingStep}', [ProjectTemplateController::class, 'updateWorkingStep'])->name('template-working-steps.update');
        Route::delete('template-working-steps/{templateWorkingStep}', [ProjectTemplateController::class, 'destroyWorkingStep'])->name('template-working-steps.destroy');

        // Template Working Sub Steps (using ProjectTemplateController)
        Route::post('template-working-sub-steps', [ProjectTemplateController::class, 'storeWorkingSubStep'])->name('template-working-sub-steps.store');
        Route::put('template-working-sub-steps/{templateWorkingSubStep}', [ProjectTemplateController::class, 'updateWorkingSubStep'])->name('template-working-sub-steps.update');
        Route::delete('template-working-sub-steps/{templateWorkingSubStep}', [ProjectTemplateController::class, 'destroyWorkingSubStep'])->name('template-working-sub-steps.destroy');

        // Reordering routes
        Route::post('template-working-steps/reorder', [ProjectTemplateController::class, 'reorderWorkingSteps'])->name('template-working-steps.reorder');
        Route::post('template-working-sub-steps/reorder', [ProjectTemplateController::class, 'reorderWorkingSubSteps'])->name('template-working-sub-steps.reorder');

        // Project Templates CRUD (using ProjectTemplateController) - langsung tanpa prefix tambahan
        Route::get('templates/create', [ProjectTemplateController::class, 'createTemplate'])->name('templates.create');
        Route::post('templates', [ProjectTemplateController::class, 'storeTemplate'])->name('templates.store');
        Route::get('templates/{projectTemplate}/edit', [ProjectTemplateController::class, 'editTemplate'])->name('templates.edit');
        Route::put('templates/{projectTemplate}', [ProjectTemplateController::class, 'updateTemplate'])->name('templates.update');
        Route::delete('templates/{projectTemplate}', [ProjectTemplateController::class, 'destroyTemplate'])->name('templates.destroy');
    });
});



// Partner Routes
Route::middleware(['auth', 'verified', 'role:partner'])->prefix('partner')->name('partner.')->group(function () {
    // Route::get('/dashboard', [PartnerController::class, 'dashboard'])->name('dashboard');
});

// Staff Routes
Route::middleware(['auth', 'verified', 'role:staff'])->prefix('staff')->name('staff.')->group(function () {
    Route::get('/dashboard', [StaffController::class, 'dashboard'])->name('dashboard');
});

// Klien Routes
Route::middleware(['auth', 'verified', 'role:klien'])->prefix('klien')->name('klien.')->group(function () {
    // Route::get('/dashboard', [KlienController::class, 'dashboard'])->name('dashboard');
});

require __DIR__ . '/auth.php';
