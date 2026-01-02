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
use App\Http\Controllers\BlackboxTestController;
use App\Models\Task;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Model binding for route parameters
Route::bind('projectKlien', function ($value) {
    return Task::findOrFail($value);
});

Route::get('/', function () {
    // Check if user is authenticated
    if (Auth::check()) {
        $user = Auth::user();
        
        // Redirect to dashboard based on role
        if ($user->role) {
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
                    return redirect()->route('dashboard');
            }
        }
        
        // If no role, redirect to dashboard which will show error
        return redirect()->route('dashboard');
    }
    
    // If not authenticated, show welcome page
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
    ]);
})->name('welcome');

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
})->middleware(['auth', 'no.cache'])->name('dashboard');

Route::middleware(['auth', 'no.cache'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
});

// Admin Routes
Route::middleware(['auth', 'verified', 'role:admin', 'no.cache'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('dashboard');
    Route::resource('users', UserController::class);
    Route::post('/users/{user}/toggle-status', [UserController::class, 'toggleStatus'])->name('users.toggle-status');
    Route::get('/users-export', [UserController::class, 'export'])->name('users.export');

    // Registered APs Management Routes
    Route::resource('registered-aps', RegisteredApController::class);

    // Login Security Monitoring Routes (Protected with unlock key)
    Route::prefix('login-security')->name('login-security.')->middleware('security.unlock')->group(function () {
        Route::get('/', [\App\Http\Controllers\Admin\LoginSecurityController::class, 'index'])->name('index');
        Route::get('/{attempt}', [\App\Http\Controllers\Admin\LoginSecurityController::class, 'show'])->name('show');
        Route::post('/unsuspend/{user}', [\App\Http\Controllers\Admin\LoginSecurityController::class, 'unsuspend'])->name('unsuspend');
        Route::post('/clear', [\App\Http\Controllers\Admin\LoginSecurityController::class, 'clear'])->name('clear');
        Route::delete('/{attempt}', [\App\Http\Controllers\Admin\LoginSecurityController::class, 'destroy'])->name('destroy');
    });

    // Security Unlock API
    Route::post('/security-unlock', function(\Illuminate\Http\Request $request) {
        $key = $request->input('key');
        $envKeyHash = env('SECURITY_UNLOCK_KEY', 'f7b0bed5e6734693069a163b0b3e196a572001a8c9f727f4e4797c84344a03ac');
        
        // Hash the input key using SHA256
        $inputKeyHash = hash('sha256', $key);
        
        // Debug logging
        Log::info('Security unlock attempt', [
            'input_key_hash' => $inputKeyHash,
            'env_key_hash' => $envKeyHash,
            'match' => $inputKeyHash === $envKeyHash
        ]);
        
        if ($inputKeyHash === $envKeyHash) {
            $request->session()->put('security_unlocked', true);
            return response()->json(['success' => true, 'message' => 'Security monitoring unlocked']);
        }
        
        return response()->json(['success' => false, 'message' => 'Invalid key'], 403);
    })->name('security.unlock');

    // Security Lock - GET route that clears session and redirects
    Route::get('/security-lock', function(\Illuminate\Http\Request $request) {
        // Debug logging
        Log::info('Security lock requested', [
            'session_id' => $request->session()->getId(),
            'user_id' => Auth::id(),
        ]);
        
        // Remove the security_unlocked flag from session
        $request->session()->forget('security_unlocked');
        
        Log::info('Security locked successfully - session cleared');
        
        // Redirect to dashboard
        return redirect()->route('admin.dashboard')->with('success', 'Security monitoring has been locked');
    })->name('security.lock');

    // Client Management Routes  
    Route::resource('clients', AdminClientController::class);

    // News Management Routes
    Route::resource('news', \App\Http\Controllers\Admin\NewsController::class);

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
Route::middleware(['auth', 'verified', 'role:company', 'no.cache'])->prefix('company')->name('company.')->group(function () {
    Route::get('/dashboard', [CompanyController::class, 'dashboard'])->name('dashboard');
    Route::get('/dashboard/pending-approvals', [CompanyController::class, 'getPendingApprovals'])->name('dashboard.pending-approvals');
    Route::get('/projects', [CompanyController::class, 'myProjects'])->name('projects.index');
    Route::get('/projects/{project}', [CompanyController::class, 'showProject'])->name('projects.show');
    Route::put('/tasks/{task}/status', [CompanyController::class, 'updateTaskStatus'])->name('tasks.update-status');
    Route::post('/tasks/{task}/comment', [CompanyController::class, 'addTaskComment'])->name('tasks.add-comment');
    
    // Approval workflow routes
    Route::get('/projects/{project}/approval-requests', [CompanyController::class, 'getApprovalRequests'])->name('projects.approval-requests');
    Route::get('/tasks/{task}/approval-detail', [CompanyController::class, 'showApprovalDetail'])->name('tasks.approval-detail');
    Route::post('/tasks/{task}/approve', [CompanyController::class, 'approveTask'])->name('tasks.approve');
    Route::post('/tasks/{task}/reject', [CompanyController::class, 'rejectTask'])->name('tasks.reject');
    
    // Task detail page route
    Route::get('/tasks/{task}/detail', [CompanyController::class, 'showTaskDetail'])->name('tasks.detail');
    
    // Client document validation routes
    Route::post('/tasks/{task}/accept-client-documents', [CompanyController::class, 'acceptClientDocuments'])->name('tasks.accept-client-documents');
    Route::post('/tasks/{task}/request-reupload', [CompanyController::class, 'requestReupload'])->name('tasks.request-reupload');
    
    // Bulk client document request routes
    Route::get('/client-documents/template', [CompanyController::class, 'downloadClientDocumentTemplate'])->name('client-documents.template');
    Route::post('/client-documents/parse-excel', [CompanyController::class, 'parseClientDocumentExcel'])->name('client-documents.parse-excel');
    
    // Project document request routes (ad-hoc document requests)
    Route::get('/projects/{project}/document-requests', [CompanyController::class, 'getProjectDocumentRequests'])->name('projects.document-requests');
    Route::post('/projects/{project}/document-requests', [CompanyController::class, 'storeProjectDocumentRequests'])->name('projects.store-document-requests');
    Route::get('/document-requests/{documentRequest}/download', [CompanyController::class, 'downloadProjectDocument'])->name('document-requests.download');
    Route::post('/document-requests/{documentRequest}/complete', [CompanyController::class, 'markProjectDocumentCompleted'])->name('document-requests.complete');
    
    // Task management routes for team leaders and above
    Route::post('/projects/{project}/tasks/{task}/update', [CompanyController::class, 'updateTaskSettings'])->name('projects.update-task');
    
    // Task assignment management routes (for team leaders and above)
    Route::middleware(['can.manage.task.assignments'])->group(function () {
        Route::post('/tasks/{task}/assign-member', [CompanyController::class, 'assignMemberToTask'])->name('tasks.assign-member');
        Route::delete('/tasks/{task}/unassign-member/{taskWorker}', [CompanyController::class, 'unassignMemberFromTask'])->name('tasks.unassign-member');
    });
    
    // Client Routes for Company
    Route::get('/clients', [CompanyClientController::class, 'index'])->name('clients.index');
    Route::get('/clients/{client}', [CompanyClientController::class, 'show'])->name('clients.show');
    
    // Teams Routes for Company
    Route::get('/teams', [\App\Http\Controllers\Company\TeamController::class, 'index'])->name('teams.index');
    Route::get('/teams/{user}', [\App\Http\Controllers\Company\TeamController::class, 'show'])->name('teams.show');
});

// Partner Routes
Route::middleware(['auth', 'verified', 'role:partner', 'no.cache'])->prefix('partner')->name('partner.')->group(function () {
    // Route::get('/dashboard', [PartnerController::class, 'dashboard'])->name('dashboard');
});

// Staff Routes
Route::middleware(['auth', 'verified', 'role:staff', 'no.cache'])->prefix('staff')->name('staff.')->group(function () {
    Route::get('/dashboard', [StaffController::class, 'dashboard'])->name('dashboard');
});

// Klien Routes
Route::middleware(['auth', 'verified', 'role:klien', 'no.cache'])->prefix('klien')->name('klien.')->group(function () {
    Route::get('/dashboard', [ClientController::class, 'dashboard'])->name('dashboard');
    Route::get('/projects', [ClientController::class, 'myProjects'])->name('projects.index');
    Route::get('/projects/{project}', [ClientController::class, 'showProject'])->name('projects.show');
    Route::get('/tasks/{task}', [ClientController::class, 'viewTask'])->name('tasks.show');
    Route::post('/tasks/{task}/submit-reply', [ClientController::class, 'submitTaskReply'])->name('tasks.submit-reply');
    Route::post('/tasks/{task}/upload-client-documents', [ClientController::class, 'uploadClientDocuments'])->name('client-documents.upload');
    Route::post('/tasks/{task}/approval', [ClientController::class, 'approveTask'])->name('tasks.approval');
    
    // Project document request routes (for clients to upload requested documents)
    Route::post('/document-requests/{documentRequest}/upload', [ClientController::class, 'uploadProjectDocument'])->name('document-requests.upload');
});

// Public News Route (accessible by all authenticated users)
Route::middleware(['auth', 'no.cache'])->group(function () {
    Route::get('/news', [\App\Http\Controllers\Admin\NewsController::class, 'indexPublic'])->name('news.index');
    Route::get('/news/{news:slug}', [\App\Http\Controllers\Admin\NewsController::class, 'showPublic'])->name('news.show');
});

// Real-time Updates API Routes
Route::middleware(['auth', 'no.cache'])->prefix('api')->group(function () {
    Route::get('/realtime/updates', [\App\Http\Controllers\Api\RealTimeUpdatesController::class, 'getUpdates'])->name('api.realtime.updates');
    Route::post('/realtime/mark-seen', [\App\Http\Controllers\Api\RealTimeUpdatesController::class, 'markAsSeen'])->name('api.realtime.mark-seen');
    Route::get('/realtime/dashboard-summary', [\App\Http\Controllers\Api\RealTimeUpdatesController::class, 'getDashboardSummary'])->name('api.realtime.dashboard-summary');
    
    // Notifications API
    Route::get('/notifications', [\App\Http\Controllers\NotificationController::class, 'index'])->name('api.notifications.index');
    Route::post('/notifications/{id}/read', [\App\Http\Controllers\NotificationController::class, 'markAsRead'])->name('api.notifications.read');
    Route::post('/notifications/read-all', [\App\Http\Controllers\NotificationController::class, 'markAllAsRead'])->name('api.notifications.read-all');
    Route::get('/notifications/unread-count', [\App\Http\Controllers\NotificationController::class, 'unreadCount'])->name('api.notifications.unread-count');
    Route::post('/notifications/auto-mark', [\App\Http\Controllers\NotificationController::class, 'autoMarkByContext'])->name('api.notifications.auto-mark');
    
    // Test route
    Route::get('/test', function () {
        return response()->json([
            'message' => 'API test works!',
            'user' => Auth::user()->name ?? 'Guest',
            'timestamp' => now()
        ]);
    });
});

// Blackbox Testing Routes (publicly accessible)
Route::get('/blackbox-test', [BlackboxTestController::class, 'index'])->name('blackbox.test');
Route::post('/blackbox-test/save-result', [BlackboxTestController::class, 'saveResult'])->name('blackbox.save-result');
Route::post('/blackbox-test/update-session', [BlackboxTestController::class, 'updateSession'])->name('blackbox.update-session');
Route::get('/blackbox-test/export/{token}', [BlackboxTestController::class, 'exportPdf'])->name('blackbox.export.pdf');

require __DIR__ . '/auth.php';
