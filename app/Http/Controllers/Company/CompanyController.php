<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ProjectTeam;
use App\Models\WorkingStep;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CompanyController extends Controller
{

    public function dashboard()
    {
        $user = Auth::user();
        
        // Get projects where user is a team member
        $projectCount = ProjectTeam::where('user_id', $user->id)->count();
        
        // Get all project_team_ids for this user
        $projectTeamIds = ProjectTeam::where('user_id', $user->id)->pluck('id');
        
        // Get tasks assigned to this user
        $taskCount = \App\Models\TaskWorker::whereIn('project_team_id', $projectTeamIds)->count();
        
        // Get completed tasks
        $completedTaskCount = \App\Models\TaskWorker::whereIn('project_team_id', $projectTeamIds)
            ->whereHas('task', function($query) {
                $query->where('completion_status', 'completed');
            })
            ->count();

        return Inertia::render('Company/Dashboard', [
            'user' => $user,
            'stats' => [
                'projects' => $projectCount,
                'tasks' => $taskCount,
                'completed_tasks' => $completedTaskCount,
                'pending_tasks' => $taskCount - $completedTaskCount,
            ]
        ]);
    }

    /**
     * Show list of projects for this company user
     */
    public function myProjects()
    {
        $user = Auth::user();
        
        // Get projects where user is a team member
        $projects = Project::whereHas('projectTeams', function($query) use ($user) {
            $query->where('user_id', $user->id);
        })
        ->with(['client', 'projectTeams' => function($query) use ($user) {
            $query->where('user_id', $user->id);
        }])
        ->orderBy('name')
        ->get()
        ->map(function($project) {
            return [
                'id' => $project->id,
                'name' => $project->name,
                'client_name' => $project->client_name,
                'status' => $project->status,
                'my_role' => $project->projectTeams->first()->role ?? 'member',
                'created_at' => $project->created_at,
            ];
        });

        return Inertia::render('Company/Projects/Index', [
            'projects' => $projects,
        ]);
    }

    /**
     * Show specific project with step locking logic
     */
    public function showProject(Project $project)
    {
        $user = Auth::user();
        
        // Check if user is member of this project
        $teamMember = ProjectTeam::where('project_id', $project->id)
            ->where('user_id', $user->id)
            ->first();
            
        if (!$teamMember) {
            abort(403, 'You are not a member of this project.');
        }

        // Get working steps with tasks
        $workingSteps = WorkingStep::where('project_id', $project->id)
            ->with(['tasks' => function($query) {
                $query->with([
                    'taskWorkers.projectTeam',
                    'taskAssignments' => function($q) {
                        $q->with(['documents', 'clientDocuments'])->orderBy('created_at', 'desc');
                    }
                ])->orderBy('order');
            }])
            ->orderBy('order')
            ->get()
            ->map(function($step) use ($user, $teamMember) {
                // Check if user can access this step
                $canAccess = $step->canAccess($user);
                
                // Get required tasks progress for previous step (to show unlock info)
                $requiredProgress = null;
                if ($step->is_locked) {
                    $previousStep = WorkingStep::where('project_id', $step->project_id)
                        ->where('order', '<', $step->order)
                        ->orderBy('order', 'desc')
                        ->first();
                    
                    if ($previousStep) {
                        $requiredProgress = $previousStep->getRequiredTasksProgress();
                    }
                }
                
                return [
                    'id' => $step->id,
                    'name' => $step->name,
                    'slug' => $step->slug,
                    'order' => $step->order,
                    'is_locked' => $step->is_locked,
                    'can_access' => $canAccess,
                    'required_progress' => $requiredProgress,
                    'tasks' => $step->tasks->map(function($task) use ($user, $teamMember) {
                        // Check if this user is assigned to this task
                        // TaskWorker has project_team_id, so we need to check if any worker's project_team_id matches our teamMember->id
                        $myAssignment = $task->taskWorkers->first(function($worker) use ($teamMember) {
                            return $worker->project_team_id == $teamMember->id;
                        });
                        
                        // Get latest assignment for display
                        $latestAssignment = $task->taskAssignments->first();
                        
                        return [
                            'id' => $task->id,
                            'name' => $task->name,
                            'slug' => $task->slug,
                            'order' => $task->order,
                            'is_required' => $task->is_required,
                            'completion_status' => $task->completion_status,
                            'status' => $task->status,
                            'client_interact' => $task->client_interact,
                            'multiple_files' => $task->multiple_files,
                            'is_assigned_to_me' => $myAssignment !== null,
                            'my_assignment_id' => $myAssignment ? $myAssignment->id : null,
                            // Latest assignment info for display
                            'latest_assignment' => $latestAssignment ? [
                                'id' => $latestAssignment->id,
                                'time' => $latestAssignment->time,
                                'notes' => $latestAssignment->notes,
                                'comment' => $latestAssignment->comment,
                                'client_comment' => $latestAssignment->client_comment,
                                'is_approved' => $latestAssignment->is_approved,
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
                                    'is_approved' => $assignment->is_approved,
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
                                        ];
                                    }),
                                ];
                            }),
                        ];
                    }),
                ];
            });

        return Inertia::render('Company/Projects/Show', [
            'project' => [
                'id' => $project->id,
                'name' => $project->name,
                'client_name' => $project->client_name,
                'status' => $project->status,
            ],
            'workingSteps' => $workingSteps,
            'myRole' => $teamMember->role,
        ]);
    }

    /**
     * Update task completion status
     */
    public function updateTaskStatus(Request $request, Task $task)
    {
        $user = Auth::user();
        
        // Check if user is assigned to this task
        $taskWorker = \App\Models\TaskWorker::where('task_id', $task->id)
            ->whereHas('projectTeam', function($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->first();
            
        if (!$taskWorker) {
            return back()->withErrors(['error' => 'You are not assigned to this task.']);
        }
        
        // Check if step is locked
        $step = $task->workingStep;
        if (!$step->canAccess($user)) {
            return back()->withErrors(['error' => 'This step is locked. Complete required tasks in the previous step first.']);
        }
        
        // Validate based on upload mode
        $uploadMode = $request->input('upload_mode', 'upload');
        
        if ($uploadMode === 'upload') {
            $request->validate([
                'notes' => 'nullable|string',
                'files.*' => 'nullable|file|max:10240', // Max 10MB per file
                'file_labels' => 'nullable|array',
                'file_labels.*' => 'nullable|string|max:255',
            ]);
        } else {
            $request->validate([
                'notes' => 'nullable|string',
                'client_documents' => 'nullable|array',
                'client_documents.*.name' => 'required|string',
                'client_documents.*.description' => 'nullable|string',
            ]);
        }
        
        // Create new TaskAssignment
        $taskAssignment = \App\Models\TaskAssignment::create([
            'task_id' => $task->id,
            'task_name' => $task->name,
            'working_step_name' => $task->working_step_name,
            'project_name' => $task->project_name,
            'project_client_name' => $task->project_client_name,
            'time' => now(),
            'notes' => $request->notes,
            'comment' => null, // Will be filled by reviewer if rejected
            'is_approved' => false,
        ]);
        
        // Handle based on upload mode
        if ($uploadMode === 'upload') {
            // Handle file uploads
            if ($request->hasFile('files')) {
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
                    \App\Models\Document::create([
                        'task_assignment_id' => $taskAssignment->id,
                        'name' => $documentName,
                        'slug' => \Illuminate\Support\Str::slug($documentName . '-' . time() . '-' . uniqid()),
                        'file' => $path,
                        'uploaded_at' => now(),
                    ]);
                }
            }
        } else {
            // Handle client document requests
            if ($request->has('client_documents') && is_array($request->client_documents)) {
                foreach ($request->client_documents as $clientDoc) {
                    \App\Models\ClientDocument::create([
                        'task_assignment_id' => $taskAssignment->id,
                        'name' => $clientDoc['name'],
                        'slug' => \Illuminate\Support\Str::slug($clientDoc['name'] . '-' . time() . '-' . uniqid()),
                        'description' => $clientDoc['description'] ?? null,
                    ]);
                }
            }
        }
        
        // Update task status if needed
        if ($task->status === 'Draft') {
            $task->status = $uploadMode === 'upload' ? 'Submitted' : 'Submitted to Client';
            $task->save();
        }
        
        // Update completion_status to in_progress when first submission is made
        if ($task->completion_status === 'pending') {
            $task->completion_status = 'in_progress';
            $task->save();
        }
        
        return back()->with('success', 'Task assignment created successfully!');
    }

    /**
     * Add comment to task
     */
    public function addTaskComment(Request $request, Task $task)
    {
        $user = Auth::user();
        
        // Check if user is assigned to this task
        $taskWorker = \App\Models\TaskWorker::where('task_id', $task->id)
            ->whereHas('projectTeam', function($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->first();
            
        if (!$taskWorker) {
            return back()->withErrors(['error' => 'You are not assigned to this task.']);
        }
        
        $request->validate([
            'comment' => 'required|string',
        ]);
        
        $task->comment = $request->comment;
        $task->save();
        
        return back()->with('success', 'Comment added successfully!');
    }
}
