<?php

use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Client\ClientController;
use App\Http\Controllers\Admin\ClientController as AdminClientController;
use App\Http\Controllers\Admin\ProjectController;
use App\Http\Controllers\Admin\RegisteredApController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Company\StaffController;
use App\Http\Controllers\Company\CompanyController;
use App\Http\Controllers\Company\CompanyClientController;
use App\Http\Controllers\Admin\ProjectTemplateController;
use App\Http\Controllers\Admin\UserController;
use App\Models\Task;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Model binding for route parameters
Route::bind('projectKlien', function ($value) {
    return Task::findOrFail($value);
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
        case 'company':
            return redirect()->route('company.dashboard');
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
});

// Admin Routes
Route::middleware(['auth', 'verified', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('dashboard');
    Route::resource('users', UserController::class);
    Route::post('/users/{user}/toggle-status', [UserController::class, 'toggleStatus'])->name('users.toggle-status');

    // Registered APs Management Routes
    Route::resource('registered-aps', RegisteredApController::class);

    // Login Security Monitoring Routes (Protected with unlock key)
    Route::prefix('login-security')->name('login-security.')->middleware('security.unlock')->group(function () {
        Route::get('/', [\App\Http\Controllers\Admin\LoginSecurityController::class, 'index'])->name('index');
        Route::get('/{attempt}', [\App\Http\Controllers\Admin\LoginSecurityController::class, 'show'])->name('show');
        Route::post('/unsuspend/{user}', [\App\Http\Controllers\Admin\LoginSecurityController::class, 'unsuspend'])->name('unsuspend');
        Route::delete('/{attempt}', [\App\Http\Controllers\Admin\LoginSecurityController::class, 'destroy'])->name('destroy');
    });

    // Security Unlock API
    Route::post('/security-unlock', function(\Illuminate\Http\Request $request) {
        $key = $request->input('key');
        $envKey = env('SECURITY_UNLOCK_KEY', 'handev');
        
        // Debug logging
        \Log::info('Security unlock attempt', [
            'input_key' => $key,
            'env_key' => $envKey,
            'match' => $key === $envKey
        ]);
        
        if ($key === $envKey) {
            $request->session()->put('security_unlocked', true);
            return response()->json(['success' => true, 'message' => 'Security monitoring unlocked']);
        }
        
        return response()->json(['success' => false, 'message' => 'Invalid key'], 403);
    })->name('security.unlock');

    // Security Lock - GET route that clears session and redirects
    Route::get('/security-lock', function(\Illuminate\Http\Request $request) {
        // Debug logging
        \Log::info('Security lock requested', [
            'session_id' => $request->session()->getId(),
        ]);
        
        // Remove the security_unlocked flag from session
        $request->session()->forget('security_unlocked');
        
        \Log::info('Security locked successfully');
        
        // Redirect to dashboard
        return redirect()->route('admin.dashboard')->with('success', 'Security monitoring has been locked');
    })->name('security.lock');

    // Client Management Routes  
    Route::resource('clients', AdminClientController::class);

    // Project Bundles Management Routes (CRUD for projects themselves)
    Route::prefix('projects')->name('projects.')->group(function () {
        Route::get('/', [ProjectController::class, 'index'])->name('bundles.index');
        Route::get('/create', [ProjectController::class, 'createBundle'])->name('bundles.create');
        Route::post('/', [ProjectController::class, 'storeBundle'])->name('bundles.store');
        Route::get('/{bundle}', [ProjectController::class, 'showBundle'])->name('bundles.show');
        Route::get('/{bundle}/edit', [ProjectController::class, 'editBundle'])->name('bundles.edit');
        Route::put('/{bundle}', [ProjectController::class, 'updateBundle'])->name('bundles.update');
        Route::delete('/{bundle}', [ProjectController::class, 'destroyBundle'])->name('bundles.destroy');

        // Project Working Steps (for non-template projects)
        Route::post('working-steps', [ProjectController::class, 'storeWorkingStep'])->name('working-steps.store');
        Route::put('working-steps/{workingStep}', [ProjectController::class, 'updateWorkingStep'])->name('working-steps.update');
        Route::delete('working-steps/{workingStep}', [ProjectController::class, 'destroyWorkingStep'])->name('working-steps.destroy');

        // Project Tasks (for non-template projects)
        Route::post('tasks', [ProjectController::class, 'storeTask'])->name('tasks.store');
        Route::put('tasks/{task}', [ProjectController::class, 'updateTask'])->name('tasks.update');
        Route::delete('tasks/{task}', [ProjectController::class, 'destroyTask'])->name('tasks.destroy');

        // Reordering routes for projects
        Route::post('working-steps/reorder', [ProjectController::class, 'reorderWorkingSteps'])->name('working-steps.reorder');
        Route::post('tasks/reorder', [ProjectController::class, 'reorderTasks'])->name('tasks.reorder');
        
        // Project name update
        Route::put('{project}/update-name', [ProjectController::class, 'updateProject'])->name('update-name');
        
        // Team management routes
        Route::post('team-members', [ProjectController::class, 'storeTeamMember'])->name('team-members.store');
        Route::put('team-members/{teamMember}', [ProjectController::class, 'updateTeamMember'])->name('team-members.update');
        Route::delete('team-members/{teamMember}', [ProjectController::class, 'destroyTeamMember'])->name('team-members.destroy');
    });

    // Admin Task Management (full access to all tasks)
    Route::post('/tasks/{task}/update-status', [ProjectController::class, 'updateTaskStatus'])->name('tasks.update-status');

    // Audit Management Routes (Old routes - might be deprecated)
    Route::get('/project', [ProjectController::class, 'index'])->name('project.index');
    Route::get('/project/client/{client}', [ProjectController::class, 'show'])->name('project.show');
    Route::get('/project/client/{client}/manage', [ProjectController::class, 'manage'])->name('project.manage');
    Route::post('/project/client/{client}/generate', [ProjectController::class, 'generateFromProjectTemplate'])->name('project.generate');
    Route::get('/project-data/{projectKlien}/edit', [ProjectController::class, 'edit'])->name('project.edit');
    Route::put('/project-data/{projectKlien}', [ProjectController::class, 'update'])->name('project.update');
    
    // Project Working Steps Reorder (Old routes - might be deprecated)
    Route::post('/project/working-steps/reorder', [ProjectController::class, 'reorderWorkingSteps'])->name('project.working-steps.reorder');
    Route::post('/project/tasks/reorder', [ProjectController::class, 'reorderTasks'])->name('project.tasks.reorder');
    
    // Project Working Steps CRUD (Old routes - might be deprecated)
    Route::post('/project/working-steps', [ProjectController::class, 'storeWorkingStep'])->name('project.working-steps.store');
    Route::put('/project/working-steps/{workingStep}', [ProjectController::class, 'updateWorkingStep'])->name('project.working-steps.update');
    Route::delete('/project/working-steps/{workingStep}', [ProjectController::class, 'destroyWorkingStep'])->name('project.working-steps.destroy');
    
    // Project Tasks CRUD (Old routes - might be deprecated)
    Route::post('/project/tasks', [ProjectController::class, 'storeTask'])->name('project.tasks.store');
    Route::put('/project/tasks/{task}', [ProjectController::class, 'updateTask'])->name('project.tasks.update');
    Route::delete('/project/tasks/{task}', [ProjectController::class, 'destroyTask'])->name('project.tasks.destroy');
    
    // Project Update (Old routes - might be deprecated)
    Route::put('/project/{project}', [ProjectController::class, 'updateProject'])->name('project.update-name');
    
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

        // Template Tasks (using ProjectTemplateController)
        Route::post('template-tasks', [ProjectTemplateController::class, 'storeTask'])->name('template-tasks.store');
        Route::put('template-tasks/{templateTask}', [ProjectTemplateController::class, 'updateTask'])->name('template-tasks.update');
        Route::delete('template-tasks/{templateTask}', [ProjectTemplateController::class, 'destroyTask'])->name('template-tasks.destroy');

        // Reordering routes
        Route::post('template-working-steps/reorder', [ProjectTemplateController::class, 'reorderWorkingSteps'])->name('template-working-steps.reorder');
        Route::post('template-tasks/reorder', [ProjectTemplateController::class, 'reorderTasks'])->name('template-tasks.reorder');

        // Project Templates CRUD (using ProjectTemplateController) - langsung tanpa prefix tambahan
        Route::get('templates/create', [ProjectTemplateController::class, 'createTemplate'])->name('templates.create');
        Route::post('templates', [ProjectTemplateController::class, 'storeTemplate'])->name('templates.store');
        Route::get('templates/{projectTemplate}/edit', [ProjectTemplateController::class, 'editTemplate'])->name('templates.edit');
        Route::put('templates/{projectTemplate}', [ProjectTemplateController::class, 'updateTemplate'])->name('templates.update');
        Route::delete('templates/{projectTemplate}', [ProjectTemplateController::class, 'destroyTemplate'])->name('templates.destroy');
    });
});



// Company Routes
Route::middleware(['auth', 'verified', 'role:company'])->prefix('company')->name('company.')->group(function () {
    Route::get('/dashboard', [CompanyController::class, 'dashboard'])->name('dashboard');
    Route::get('/projects', [CompanyController::class, 'myProjects'])->name('projects.index');
    Route::get('/projects/{project}', [CompanyController::class, 'showProject'])->name('projects.show');
    Route::put('/tasks/{task}/status', [CompanyController::class, 'updateTaskStatus'])->name('tasks.update-status');
    Route::post('/tasks/{task}/comment', [CompanyController::class, 'addTaskComment'])->name('tasks.add-comment');
    Route::post('/tasks/{task}/submit-for-review', [CompanyController::class, 'submitForReview'])->name('tasks.submit-for-review');
    
    // Approval workflow routes
    Route::get('/projects/{project}/approval-requests', [CompanyController::class, 'getApprovalRequests'])->name('projects.approval-requests');
    Route::post('/tasks/{task}/approve', [CompanyController::class, 'approveTask'])->name('tasks.approve');
    Route::post('/tasks/{task}/reject', [CompanyController::class, 'rejectTask'])->name('tasks.reject');
    
    // Client document validation routes
    Route::post('/tasks/{task}/accept-client-documents', [CompanyController::class, 'acceptClientDocuments'])->name('tasks.accept-client-documents');
    Route::post('/tasks/{task}/request-reupload', [CompanyController::class, 'requestReupload'])->name('tasks.request-reupload');
    
    // Client Routes for Company
    Route::get('/clients', [CompanyClientController::class, 'index'])->name('clients.index');
    Route::get('/clients/{client}', [CompanyClientController::class, 'show'])->name('clients.show');
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
    Route::get('/dashboard', [ClientController::class, 'dashboard'])->name('dashboard');
    Route::get('/projects', [ClientController::class, 'myProjects'])->name('projects.index');
    Route::get('/projects/{project}', [ClientController::class, 'showProject'])->name('projects.show');
    Route::get('/tasks/{task}', [ClientController::class, 'viewTask'])->name('tasks.show');
    Route::post('/tasks/{task}/submit-reply', [ClientController::class, 'submitTaskReply'])->name('tasks.submit-reply');
    Route::post('/tasks/{task}/upload-client-documents', [ClientController::class, 'uploadClientDocuments'])->name('client-documents.upload');
});

require __DIR__ . '/auth.php';
