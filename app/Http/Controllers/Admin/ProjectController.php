<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\Document;
use App\Models\Project;
use App\Models\ProjectTeam;
use App\Models\Task;
use App\Models\TaskApproval;
use App\Models\TaskAssignment;
use App\Models\TaskWorker;
use App\Models\User;
use App\Models\WorkingStep;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ProjectController extends Controller
{
    // ==================== BUNDLE MANAGEMENT ====================
    
    public function index(Request $request)
    {
        $search = $request->input('search', '');
        $year = $request->input('year', '');
        
        $query = Project::with(['client:id,name', 'projectTeams' => function($q) {
            $q->where('role', 'partner')->select('id', 'project_id', 'user_id', 'user_name', 'role');
        }]);

        // Search filter
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('client_name', 'like', "%{$search}%");
            });
        }

        // Year filter - use year column instead of created_at
        if ($year) {
            $query->where('year', $year);
        }

        $projects = $query->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        // Get available years from year column
        $availableYears = Project::select('year')
            ->distinct()
            ->orderBy('year', 'desc')
            ->pluck('year');

        return Inertia::render('Admin/Project/Index', [
            'bundles' => $projects,
            'filters' => [
                'search' => $search,
                'year' => $year,
            ],
            'availableYears' => $availableYears,
        ]);
    }

    public function createBundle()
    {
        // Get all clients with their used years
        $clients = \App\Models\Client::orderBy('name')
            ->get(['id', 'name', 'alamat', 'kementrian', 'kode_satker'])
            ->map(function ($client) {
                $usedYears = Project::where('client_id', $client->id)
                    ->pluck('year')
                    ->toArray();
                $client->used_years = $usedYears;
                return $client;
            });

        // Get all users (company role only)
        $availableUsers = User::where('role', 'company')
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'position']);

        // Get all project templates
        $templates = \App\Models\ProjectTemplate::orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('Admin/Project/Create', [
            'clients' => $clients,
            'availableUsers' => $availableUsers,
            'templates' => $templates,
        ]);
    }

    public function storeBundle(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:projects,name',
            'client_id' => 'required|exists:clients,id',
            'year' => 'required|integer|min:2000|max:' . date('Y'),
            'team_members' => 'nullable|array',
            'team_members.*.user_id' => 'required|exists:users,id',
            'team_members.*.role' => 'required|in:partner,manager,supervisor,team leader,member',
            'template_id' => 'nullable|exists:project_templates,id',
        ]);

        // Check if project with same client and year already exists
        $existingProject = Project::where('client_id', $request->client_id)
            ->where('year', $request->year)
            ->first();
        
        if ($existingProject) {
            return back()->withErrors([
                'year' => 'A project for this client in year ' . $request->year . ' already exists: ' . $existingProject->name
            ])->withInput();
        }

        // Get client data
        $client = \App\Models\Client::find($request->client_id);

        // Create project with denormalized client data
        $project = Project::create([
            'name' => $request->name,
            'slug' => \Str::slug($request->name . '-' . now()->timestamp),
            'client_id' => $request->client_id,
            'year' => $request->year,
            'client_name' => $client->name,
            'client_alamat' => $client->alamat,
            'client_kementrian' => $client->kementrian,
            'client_kode_satker' => $client->kode_satker,
        ]);

        // Add team members if provided
        if ($request->has('team_members') && !empty($request->team_members)) {
            foreach ($request->team_members as $memberData) {
                $user = User::find($memberData['user_id']);
                if ($user) {
                    ProjectTeam::create([
                        'project_id' => $project->id,
                        'user_id' => $user->id,
                        'project_name' => $project->name,
                        'project_client_name' => $client->name,
                        'user_name' => $user->name,
                        'user_email' => $user->email,
                        'user_position' => $user->position,
                        'role' => $memberData['role'],
                    ]);
                }
            }
        }

        // Copy from template if provided
        if ($request->template_id) {
            $this->copyTemplateToProject($request->template_id, $project->id);
        }

        return redirect()->route('admin.projects.bundles.index')
            ->with('success', 'Project created successfully!');
    }

    /**
     * Copy template structure to project
     */
    private function copyTemplateToProject($templateId, $projectId)
    {
        $template = \App\Models\ProjectTemplate::find($templateId);
        $project = Project::find($projectId);

        // Get template steps from template_working_steps table
        $templateSteps = \App\Models\TemplateWorkingStep::where('project_template_id', $templateId)
            ->with('templateTasks')
            ->orderBy('order')
            ->get();

        foreach ($templateSteps as $index => $templateStep) {
            // Create step for project in working_steps table
            $newStep = WorkingStep::create([
                'project_id' => $projectId,
                'name' => $templateStep->name,
                'slug' => $templateStep->slug . '-' . $projectId, // Make slug unique per project
                'order' => $templateStep->order,
                'is_locked' => $index === 0 ? false : true, // First step unlocked, others locked
                'project_name' => $project->name,
                'project_client_name' => $project->client_name,
            ]);

            // Copy tasks from template_tasks to tasks
            foreach ($templateStep->templateTasks as $templateTask) {
                // Generate truly unique slug
                $baseSlug = $templateTask->slug;
                $slug = $baseSlug . '-' . $projectId;
                $count = 1;
                while (Task::where('slug', $slug)->exists()) {
                    $slug = $baseSlug . '-' . $projectId . '-' . $count;
                    $count++;
                }
                
                Task::create([
                    'project_id' => $projectId,
                    'working_step_id' => $newStep->id,
                    'name' => $templateTask->name,
                    'slug' => $slug,
                    'order' => $templateTask->order,
                    'client_interact' => $templateTask->client_interact,
                    'multiple_files' => $templateTask->multiple_files,
                    'is_required' => $templateTask->is_required ?? false,
                    'completion_status' => 'pending',
                    'project_name' => $project->name,
                    'project_client_name' => $project->client_name,
                    'working_step_name' => $newStep->name,
                ]);
            }
        }
    }

    public function showBundle(Project $bundle)
    {
        // Get working steps for this project
        $workingSteps = WorkingStep::where('project_id', $bundle->id)
            ->with(['tasks' => function($query) {
                $query->with([
                    'taskWorkers',
                    'taskApprovals' => function($q) {
                        $q->orderBy('order');
                    },
                    'taskAssignments' => function($q) {
                        $q->with(['documents', 'clientDocuments'])->orderBy('created_at', 'desc');
                    }
                ])->orderBy('order');
            }])
            ->orderBy('order')
            ->get()
            ->map(function($step) {
                return [
                    'id' => $step->id,
                    'name' => $step->name,
                    'slug' => $step->slug,
                    'order' => $step->order,
                    'is_locked' => $step->is_locked,
                    'can_access' => true, // Admin always has access
                    'required_progress' => null,
                    'tasks' => $step->tasks->map(function($task) {
                        // Get latest assignment for display
                        $latestAssignment = $task->taskAssignments->first();
                        
                        return [
                            'id' => $task->id,
                            'name' => $task->name,
                            'slug' => $task->slug,
                            'order' => $task->order,
                            'is_required' => $task->is_required,
                            'completion_status' => $task->completion_status,
                            'status' => $latestAssignment->status ?? 'Draft',
                            'client_interact' => $task->client_interact,
                            'multiple_files' => $task->multiple_files,
                            'is_assigned_to_me' => true, // Admin can edit all tasks
                            'my_assignment_id' => null,
                            // Task approvals configuration (for dynamic dropdown)
                            'task_approvals' => $task->taskApprovals->map(function($approval) {
                                return [
                                    'id' => $approval->id,
                                    'role' => $approval->role,
                                    'order' => $approval->order,
                                    'status_name_pending' => $approval->status_name_pending,
                                    'status_name_progress' => $approval->status_name_progress,
                                    'status_name_complete' => $approval->status_name_complete,
                                    'status_name_reject' => $approval->status_name_reject,
                                ];
                            }),
                            // Latest assignment info for display
                            'latest_assignment' => $latestAssignment ? [
                                'id' => $latestAssignment->id,
                                'time' => $latestAssignment->time,
                                'notes' => $latestAssignment->notes,
                                'status' => $latestAssignment->status,
                                'comment' => $latestAssignment->comment,
                                'client_comment' => $latestAssignment->client_comment,
                                'created_at' => $latestAssignment->created_at,
                            ] : null,
                            // All assignments with documents
                            'assignments' => $task->taskAssignments->map(function($assignment) {
                                return [
                                    'id' => $assignment->id,
                                    'time' => $assignment->time,
                                    'notes' => $assignment->notes,
                                    'comment' => $assignment->comment,
                                    'client_comment' => $assignment->client_comment,
                                    'created_at' => $assignment->created_at,
                                    'documents' => $assignment->documents->map(function($doc) {
                                        return [
                                            'id' => $doc->id,
                                            'name' => $doc->name,
                                            'file' => $doc->file,
                                            'uploaded_at' => $doc->uploaded_at,
                                        ];
                                    }),
                                    'client_documents' => $assignment->clientDocuments->map(function($clientDoc) {
                                        return [
                                            'id' => $clientDoc->id,
                                            'name' => $clientDoc->name,
                                            'description' => $clientDoc->description,
                                            'file' => $clientDoc->file,
                                            'uploaded_at' => $clientDoc->uploaded_at,
                                        ];
                                    }),
                                ];
                            }),
                        ];
                    }),
                ];
            });

        // Get team members with their assigned tasks
        $teamMembers = ProjectTeam::where('project_id', $bundle->id)
            ->with('taskWorkers')
            ->orderBy('role')
            ->orderBy('user_name')
            ->get();

        return Inertia::render('Admin/Project/Show', [
            'bundle' => $bundle,
            'project' => [
                'id' => $bundle->id,
                'name' => $bundle->name,
                'client_name' => $bundle->client_name,
                'status' => $bundle->status,
            ],
            'workingSteps' => $workingSteps,
            'teamMembers' => $teamMembers,
        ]);
    }

    public function editBundle(Project $bundle)
    {
        // Get working steps for this project
        $workingSteps = WorkingStep::where('project_id', $bundle->id)
            ->with(['tasks' => function($query) {
                $query->with(['taskWorkers', 'taskApprovals' => function($q) {
                    $q->orderBy('order');
                }])->orderBy('order');
            }])
            ->orderBy('order')
            ->get();

        // Get team members
        $teamMembers = ProjectTeam::where('project_id', $bundle->id)
            ->orderBy('role')
            ->orderBy('user_name')
            ->get();

        // Get available users (company level only)
        $availableUsers = User::where('role', 'company')
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'position']);

        // Get clients with their used years
        $clients = Client::with('clientUsers')->orderBy('name')->get()
            ->map(function ($client) use ($bundle) {
                $usedYears = Project::where('client_id', $client->id)
                    ->where('id', '!=', $bundle->id) // Exclude current project
                    ->pluck('year')
                    ->toArray();
                $client->used_years = $usedYears;
                return $client;
            });

        return Inertia::render('Admin/Project/Edit', [
            'bundle' => $bundle,
            'workingSteps' => $workingSteps,
            'teamMembers' => $teamMembers,
            'availableUsers' => $availableUsers,
            'clients' => $clients,
        ]);
    }

    public function updateBundle(Request $request, Project $bundle)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:projects,name,' . $bundle->id,
            'client_id' => 'required|exists:clients,id',
            'year' => 'required|integer|min:2000|max:' . date('Y'),
            'status' => 'required|in:open,closed',
        ]);

        // Check if project with same client and year already exists (excluding current project)
        $existingProject = Project::where('client_id', $request->client_id)
            ->where('year', $request->year)
            ->where('id', '!=', $bundle->id)
            ->first();
        
        if ($existingProject) {
            return back()->withErrors([
                'year' => 'A project for this client in year ' . $request->year . ' already exists: ' . $existingProject->name
            ])->withInput();
        }

        // Get client for denormalized data
        $client = Client::findOrFail($request->client_id);

        // Update project with denormalized client data
        $bundle->update([
            'name' => $request->name,
            'year' => $request->year,
            'status' => $request->status,
            'client_id' => $client->id,
            'client_name' => $client->name,
            'client_alamat' => $client->alamat,
            'client_kementrian' => $client->kementrian,
            'client_kode_satker' => $client->kode_satker,
        ]);

        // Update denormalized client data in project_teams
        ProjectTeam::where('project_id', $bundle->id)->update([
            'project_client_name' => $client->name,
        ]);

        // Update denormalized client data in working_steps
        WorkingStep::where('project_id', $bundle->id)->update([
            'project_client_name' => $client->name,
        ]);

        // Update denormalized client data in tasks
        Task::where('project_id', $bundle->id)->update([
            'project_client_name' => $client->name,
        ]);

        // Update denormalized client data in task_workers
        TaskWorker::whereHas('task', function($query) use ($bundle) {
            $query->where('project_id', $bundle->id);
        })->update([
            'project_client_name' => $client->name,
        ]);

        // Update denormalized client data in task_assignments
        TaskAssignment::whereHas('task', function($query) use ($bundle) {
            $query->where('project_id', $bundle->id);
        })->update([
            'project_client_name' => $client->name,
        ]);

        return redirect()->route('admin.projects.bundles.edit', $bundle->id)
            ->with('success', 'Project updated successfully!');
    }

    public function destroyBundle(Project $bundle)
    {
        // Check if project has working steps
        if ($bundle->workingSteps()->exists()) {
            return redirect()->route('admin.projects.bundles.index')
                ->with('error', 'Cannot delete project that still has working steps!');
        }

        $bundle->delete();

        return redirect()->route('admin.projects.bundles.index')
            ->with('success', 'Project deleted successfully!');
    }

    // ==================== WORKING STEP MANAGEMENT ====================

    public function storeWorkingStep(Request $request)
    {
        try {
            // Support multiple parameter names for project ID
            $projectId = $request->bundle_id ?? $request->project_id;
            
            $request->validate([
                'name' => 'required|string|max:255',
            ]);

            // Validate project exists
            if (!$projectId || !Project::find($projectId)) {
                return redirect()->back()->with('error', 'Invalid project ID. Parameters: ' . json_encode($request->all()));
            }

            // Get project for denormalized data
            $project = Project::find($projectId);

            // Get next order number for this project
            $nextOrder = WorkingStep::where('project_id', $projectId)
                ->max('order') + 1;

            // Generate unique slug
            $baseSlug = Str::slug($request->name);
            $slug = $baseSlug . '-' . $projectId;
            $count = 1;
            while (WorkingStep::where('slug', $slug)->exists()) {
                $slug = $baseSlug . '-' . $projectId . '-' . $count;
                $count++;
            }

            // Create working step with generated slug
            $workingStep = WorkingStep::create([
                'name' => $request->name,
                'slug' => $slug,
                'project_id' => $projectId,
                'order' => $nextOrder,
                'project_name' => $project->name,
                'project_client_name' => $project->client_name,
            ]);

            return redirect()->back()->with('success', 'Working step created successfully!');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to create working step: ' . $e->getMessage());
        }
    }

    public function updateWorkingStep(Request $request, WorkingStep $workingStep)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        // Generate new slug if name changed
        $updateData = [
            'name' => $request->name,
        ];

        if ($workingStep->name !== $request->name) {
            $baseSlug = Str::slug($request->name);
            $slug = $baseSlug . '-' . $workingStep->project_id;
            $count = 1;
            while (WorkingStep::where('slug', $slug)->where('id', '!=', $workingStep->id)->exists()) {
                $slug = $baseSlug . '-' . $workingStep->project_id . '-' . $count;
                $count++;
            }
            $updateData['slug'] = $slug;
        }

        // Update working step
        $workingStep->update($updateData);

        return redirect()->back()->with('success', 'Working step updated successfully!');
    }

    public function destroyWorkingStep(WorkingStep $workingStep)
    {
        // Delete all related tasks
        $workingStep->tasks()->delete();
        
        // Delete the working step
        $workingStep->delete();

        return redirect()->back()->with('success', 'Working step and tasks deleted successfully!');
    }

    // ==================== TASK MANAGEMENT ====================

    public function storeTask(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'working_step_id' => 'required|exists:working_steps,id',
            'client_interact' => 'required|string|in:read only,comment,upload',
            'multiple_files' => 'boolean',
            'is_required' => 'boolean',
        ]);

        // Get the working step to get project_id
        $workingStep = WorkingStep::findOrFail($request->working_step_id);
        
        // Get project for denormalized data
        $project = Project::find($workingStep->project_id);

        // Get next order number for this working step
        $nextOrder = Task::where('working_step_id', $request->working_step_id)
            ->max('order') + 1;

        // Generate unique slug
        $baseSlug = Str::slug($request->name);
        $slug = $baseSlug;
        $count = 1;
        while (Task::where('slug', $slug)->exists()) {
            $slug = $baseSlug . '-' . $count;
            $count++;
        }

        // Create task with generated slug
        $task = Task::create([
            'name' => $request->name,
            'slug' => $slug,
            'working_step_id' => $request->working_step_id,
            'project_id' => $workingStep->project_id,
            'order' => $nextOrder,
            'client_interact' => $request->client_interact,
            'multiple_files' => $request->boolean('multiple_files'),
            'is_required' => $request->boolean('is_required'),
            'completion_status' => 'pending',
            'project_name' => $project->name,
            'project_client_name' => $project->client_name,
            'working_step_name' => $workingStep->name,
        ]);

        return redirect()->back()->with('success', 'Task created successfully!');
    }

    public function updateTask(Request $request, Task $task)
    {

        $request->validate([
            'name' => 'required|string|max:255',
            'client_interact' => 'required|in:read only,comment,upload',
            'multiple_files' => 'boolean',
            'worker_ids' => 'nullable|array',
            'worker_ids.*' => 'exists:project_teams,id',
            'approval_roles' => 'nullable|array',
            'approval_roles.*' => 'in:partner,manager,supervisor,team leader',
        ]);

        // Generate new slug if name changed
        $updateData = [
            'name' => $request->name,
            'client_interact' => $request->client_interact,
            'multiple_files' => $request->boolean('multiple_files'),
            'is_required' => $request->boolean('is_required'),
        ];

        if ($task->name !== $request->name) {
            $baseSlug = Str::slug($request->name);
            $slug = $baseSlug;
            $count = 1;
            while (Task::where('slug', $slug)->where('id', '!=', $task->id)->exists()) {
                $slug = $baseSlug . '-' . $count;
                $count++;
            }
            $updateData['slug'] = $slug;
        }

        $task->update($updateData);

        // Refresh model to get updated data
        $task->refresh();

        // Sync workers - Delete old ones and create new ones
        if ($request->has('worker_ids')) {
            // Delete existing workers for this task
            $task->taskWorkers()->delete();

            // Create new workers with denormalized data
            if (!empty($request->worker_ids)) {
                foreach ($request->worker_ids as $projectTeamId) {
                    $projectTeam = ProjectTeam::find($projectTeamId);
                    
                    if ($projectTeam) {
                        TaskWorker::create([
                            'task_id' => $task->id,
                            'project_team_id' => $projectTeam->id,
                            'task_name' => $task->name,
                            'working_step_name' => $task->working_step_name,
                            'project_name' => $task->project_name,
                            'project_client_name' => $task->project_client_name,
                            'worker_name' => $projectTeam->user_name,
                            'worker_email' => $projectTeam->user_email,
                            'worker_role' => $projectTeam->role,
                        ]);
                    }
                }
            }
        }

        // Sync approval roles - Delete old ones and create new ones with AUTO-SORT by priority
        if ($request->has('approval_roles')) {
            // Delete existing approvals for this task
            $task->taskApprovals()->delete();

            // Create new approvals with denormalized data and order
            if (!empty($request->approval_roles)) {
                // Define role priority order (lower number = higher priority / earlier in workflow)
                $rolePriority = [
                    'team leader' => 1,
                    'supervisor' => 2,
                    'manager' => 3,
                    'partner' => 4,
                ];
                
                // Define status names for each role
                $roleStatusNames = [
                    'team leader' => [
                        'pending' => 'Waiting for Team Leader review',
                        'progress' => 'Under Review by Team Leader',
                        'reject' => 'Returned for Revision (by Team Leader)',
                        'complete' => 'Approved by Team Leader',
                    ],
                    'manager' => [
                        'pending' => 'Waiting for Manager review',
                        'progress' => 'Under Review by Manager',
                        'reject' => 'Returned for Revision (by Manager)',
                        'complete' => 'Approved by Manager',
                    ],
                    'supervisor' => [
                        'pending' => 'Waiting for Supervisor review',
                        'progress' => 'Under Review by Supervisor',
                        'reject' => 'Returned for Revision (by Supervisor)',
                        'complete' => 'Approved by Supervisor',
                    ],
                    'partner' => [
                        'pending' => 'Waiting for Partner review',
                        'progress' => 'Under Review by Partner',
                        'reject' => 'Returned for Revision (by Partner)',
                        'complete' => 'Approved by Partner',
                    ],
                ];
                
                // Sort selected roles by priority BEFORE creating approvals
                $sortedRoles = $request->approval_roles;
                usort($sortedRoles, function($a, $b) use ($rolePriority) {
                    return $rolePriority[strtolower($a)] <=> $rolePriority[strtolower($b)];
                });
                
                // Create task approvals with correct order based on priority
                foreach ($sortedRoles as $role) {
                    $roleLower = strtolower($role);
                    $statusNames = $roleStatusNames[$roleLower];
                    
                    TaskApproval::create([
                        'task_id' => $task->id,
                        'role' => $roleLower,
                        'order' => $rolePriority[$roleLower], // Use role priority as order
                        'task_name' => $task->name,
                        'working_step_name' => $task->working_step_name,
                        'project_name' => $task->project_name,
                        'project_client_name' => $task->project_client_name,
                        'status_name_pending' => $statusNames['pending'],
                        'status_name_progress' => $statusNames['progress'],
                        'status_name_reject' => $statusNames['reject'],
                        'status_name_complete' => $statusNames['complete'],
                    ]);
                }
            }
        }

        return redirect()->back()->with('success', 'Task updated successfully!');
    }

    public function destroyTask(Task $task)
    {
        $task->delete();

        return redirect()->back()->with('success', 'Task deleted successfully!');
    }

    // ==================== REORDERING METHODS ====================

    public function reorderWorkingSteps(Request $request)
    {
        $request->validate([
            'steps' => 'required|array',
            'steps.*.id' => 'required|exists:working_steps,id',
            'steps.*.order' => 'required|integer|min:0',
        ]);

        foreach ($request->steps as $stepData) {
            WorkingStep::where('id', $stepData['id'])
                ->update(['order' => $stepData['order']]);
        }

        return response()->json(['message' => 'Working steps reordered successfully']);
    }

    public function reorderTasks(Request $request)
    {
        try {
            $request->validate([
                'tasks' => 'required|array',
                'tasks.*.id' => 'required|exists:tasks,id',
                'tasks.*.order' => 'required|integer|min:1',
                'tasks.*.working_step_id' => 'required|exists:working_steps,id',
            ]);

            foreach ($request->tasks as $taskData) {
                Task::where('id', $taskData['id'])
                    ->update([
                        'order' => $taskData['order'],
                        'working_step_id' => $taskData['working_step_id']
                    ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Tasks reordered successfully'
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error reordering tasks: ' . $e->getMessage()
            ], 500);
        }
    }

    // ==================== PROJECT MANAGEMENT ====================
    
    public function updateProject(Request $request, Project $project)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $project->update([
            'name' => $request->name,
        ]);

        return redirect()->back()->with('success', 'Project updated successfully!');
    }

    // ==================== TEAM MANAGEMENT ====================
    
    public function storeTeamMember(Request $request)
    {
        $request->validate([
            'project_id' => 'required|exists:projects,id',
            'user_id' => 'required|exists:users,id',
            'role' => 'required|in:partner,manager,supervisor,team leader,member',
        ]);

        $project = Project::findOrFail($request->project_id);
        $user = User::findOrFail($request->user_id);

        // Check if user already in team
        $exists = ProjectTeam::where('project_id', $project->id)
            ->where('user_id', $user->id)
            ->exists();

        if ($exists) {
            return redirect()->back()->with('error', 'User already exists in this project team!');
        }

        ProjectTeam::create([
            'project_id' => $project->id,
            'user_id' => $user->id,
            'project_name' => $project->name,
            'project_client_name' => $project->client_name,
            'user_name' => $user->name,
            'user_email' => $user->email,
            'user_position' => $user->position ?? null,
            'role' => $request->role,
        ]);

        return redirect()->back()->with('success', 'Team member added successfully!');
    }

    public function updateTeamMember(Request $request, $teamId)
    {
        $request->validate([
            'role' => 'required|in:partner,manager,supervisor,team leader,member',
        ]);

        $teamMember = ProjectTeam::findOrFail($teamId);
        $teamMember->update([
            'role' => $request->role,
        ]);

        return redirect()->back()->with('success', 'Team member role updated successfully!');
    }

    public function destroyTeamMember($teamId)
    {
        $teamMember = ProjectTeam::findOrFail($teamId);
        $teamMember->delete();

        return redirect()->back()->with('success', 'Team member removed successfully!');
    }

    /**
     * Admin: Update task (no restrictions)
     */
    public function updateTaskStatus(Request $request, Task $task)
    {
        $request->validate([
            'notes' => 'nullable|string',
            'upload_mode' => 'required|in:upload,request',
            // TWO separate status fields - Admin can override both
            'completion_status' => 'required|string|in:pending,in_progress,completed', // for tasks table
            'assignment_status' => 'required|string', // for task_assignments table
            'files.*' => 'nullable|file|max:10240', // Max 10MB per file
            'file_labels' => 'nullable|array',
            'file_labels.*' => 'nullable|string|max:255',
            'client_documents' => 'nullable|array',
            'client_documents.*.name' => 'required|string|max:255',
            'client_documents.*.description' => 'nullable|string',
        ]);
        
        // Get or create TaskAssignment
        // Admin can edit existing assignment (not always create new)
        $taskAssignment = $task->taskAssignments()->latest()->first();
        
        if ($taskAssignment) {
            // UPDATE existing assignment (admin edit mode)
            $taskAssignment->update([
                'notes' => $request->notes,
                'time' => now(),
            ]);
        } else {
            // CREATE new assignment (first time)
            $taskAssignment = \App\Models\TaskAssignment::create([
                'task_id' => $task->id,
                'task_name' => $task->name,
                'working_step_name' => $task->working_step_name,
                'project_name' => $task->project_name,
                'project_client_name' => $task->project_client_name,
                'time' => now(),
                'notes' => $request->notes,
                'comment' => null,
            ]);
        }
        
        // Handle based on upload mode
        if ($request->upload_mode === 'upload') {
            // Upload Files Mode - Store actual files
            if ($request->hasFile('files')) {
                // If admin uploads new files, delete old ones from this assignment
                $taskAssignment->documents()->delete();
                
                $files = $request->file('files');
                $fileLabels = $request->input('file_labels', []);
                
                // Get task storage path: clients/{client_slug}/{project_slug}/{task_slug}
                $taskStoragePath = $task->getStoragePath();
                
                foreach ($files as $index => $file) {
                    $originalName = $file->getClientOriginalName();
                    $filename = time() . '_' . uniqid() . '_' . $originalName;
                    
                    // Store in task-specific directory
                    $path = $file->storeAs($taskStoragePath, $filename, 'public');
                    
                    // Get label for this file (use label if provided, otherwise use original filename)
                    $documentName = !empty($fileLabels[$index]) ? $fileLabels[$index] : $originalName;
                    
                    // Create document record linked to this assignment
                    Document::create([
                        'task_assignment_id' => $taskAssignment->id,
                        'name' => $documentName,
                        'slug' => Str::slug($documentName . '-' . time() . '-' . uniqid()),
                        'file' => $path,
                        'uploaded_at' => now(),
                    ]);
                }
            }
        } elseif ($request->upload_mode === 'request') {
            // Request from Client Mode - Create document requests
            if ($request->has('client_documents') && is_array($request->client_documents)) {
                // If admin updates client document requests, delete old ones
                $taskAssignment->clientDocuments()->delete();
                
                foreach ($request->client_documents as $clientDoc) {
                    if (!empty($clientDoc['name'])) {
                        \App\Models\ClientDocument::create([
                            'task_assignment_id' => $taskAssignment->id,
                            'name' => $clientDoc['name'],
                            'description' => $clientDoc['description'] ?? null,
                            'slug' => Str::slug($clientDoc['name'] . '-' . time() . '-' . uniqid()),
                            'file' => null, // Will be filled when client uploads
                            'uploaded_at' => null,
                        ]);
                    }
                }
            }
        }
        
        // Admin can manually set BOTH status fields
        // 1. Update task_assignments.status (assignment workflow status)
        $latestAssignment = $task->taskAssignments()->latest()->first();
        if ($latestAssignment && $request->has('assignment_status')) {
            $latestAssignment->status = $request->assignment_status;
            $latestAssignment->save();
        }
        
        // 2. Update tasks.completion_status (overall task progress)
        if ($request->has('completion_status')) {
            $task->completion_status = $request->completion_status;
            $task->save();
        }
        
        return back()->with('success', 'Task updated successfully - Completion: ' . $request->completion_status . ', Assignment: ' . $request->assignment_status);
    }
}
