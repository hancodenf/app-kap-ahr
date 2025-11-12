<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ProjectTeam;
use App\Models\WorkingStep;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CompanyController extends Controller
{

    public function dashboard()
    {
        $user = Auth::user();
        
        // Get all project_team_ids for this user
        $projectTeamIds = ProjectTeam::where('user_id', $user->id)->pluck('id');
        
        // Check if user has any project teams
        $hasProjects = $projectTeamIds->isNotEmpty();
        
        // 1. Project Statistics
        $projectStats = [
            'total' => ProjectTeam::where('user_id', $user->id)->count(),
            'active' => ProjectTeam::where('user_id', $user->id)
                ->whereHas('project', function($query) {
                    $query->where('status', 'open');
                })
                ->count(),
            'closed' => ProjectTeam::where('user_id', $user->id)
                ->whereHas('project', function($query) {
                    $query->where('status', 'closed');
                })
                ->count(),
            'by_role' => $hasProjects 
                ? ProjectTeam::where('user_id', $user->id)
                    ->select('role', DB::raw('count(*) as count'))
                    ->groupBy('role')
                    ->pluck('count', 'role')
                    ->toArray()
                : [],
        ];
        
        // 2. Task Statistics
        $taskStats = [
            'total' => $hasProjects 
                ? \App\Models\TaskWorker::whereIn('project_team_id', $projectTeamIds)->count()
                : 0,
            'completed' => $hasProjects 
                ? \App\Models\TaskWorker::whereIn('project_team_id', $projectTeamIds)
                    ->whereHas('task', function($query) {
                        $query->where('completion_status', 'completed');
                    })
                    ->count()
                : 0,
            'in_progress' => $hasProjects 
                ? \App\Models\TaskWorker::whereIn('project_team_id', $projectTeamIds)
                    ->whereHas('task', function($query) {
                        $query->where('completion_status', 'in_progress');
                    })
                    ->count()
                : 0,
            'pending' => $hasProjects 
                ? \App\Models\TaskWorker::whereIn('project_team_id', $projectTeamIds)
                    ->whereHas('task', function($query) {
                        $query->where('completion_status', 'pending');
                    })
                    ->count()
                : 0,
        ];
        
        // 3. Recent Projects (last 5)
        $recentProjects = Project::whereHas('projectTeams', function($query) use ($user) {
            $query->where('user_id', $user->id);
        })
        ->with(['projectTeams' => function($query) use ($user) {
            $query->where('user_id', $user->id);
        }])
        ->orderBy('created_at', 'desc')
        ->limit(5)
        ->get()
        ->map(function($project) {
            return [
                'id' => $project->id,
                'name' => $project->name,
                'client_name' => $project->client_name,
                'status' => $project->status,
                'my_role' => $project->projectTeams->first()->role ?? 'member',
                'created_at' => $project->created_at->format('Y-m-d H:i:s'),
            ];
        });
        
        // 4. My Active Tasks (tasks assigned to me that are not completed)
        $myActiveTasks = $hasProjects
            ? \App\Models\TaskWorker::whereIn('project_team_id', $projectTeamIds)
                ->with(['task' => function($query) {
                    $query->with('workingStep.project')
                        ->where('completion_status', '!=', 'completed');
                }])
                ->get()
                ->filter(function($taskWorker) {
                    return $taskWorker->task !== null;
                })
                ->map(function($taskWorker) {
                    return [
                        'id' => $taskWorker->task->id,
                        'name' => $taskWorker->task->name,
                        'project_name' => $taskWorker->task->project_name,
                        'working_step_name' => $taskWorker->task->working_step_name,
                        'completion_status' => $taskWorker->task->completion_status,
                        'status' => $taskWorker->task->status,
                        'is_required' => $taskWorker->task->is_required,
                    ];
                })
                ->take(10)
            : collect([]);
        
        // 5. Task Completion Trend (last 7 days)
        $taskTrend = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $count = $hasProjects
                ? \App\Models\TaskWorker::whereIn('project_team_id', $projectTeamIds)
                    ->whereHas('task', function($query) use ($date) {
                        $query->where('completion_status', 'completed')
                            ->whereDate('updated_at', $date->format('Y-m-d'));
                    })
                    ->count()
                : 0;
            
            $taskTrend[] = [
                'date' => $date->format('Y-m-d'),
                'count' => $count,
            ];
        }
        
        // 6. Projects by Status
        $projectsByStatus = $hasProjects
            ? Project::whereHas('projectTeams', function($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray()
            : [];
        
        // 7. Upcoming Deadlines (tasks with assignments in next 7 days)
        $upcomingDeadlines = $hasProjects
            ? \App\Models\TaskWorker::whereIn('project_team_id', $projectTeamIds)
                ->with(['task.taskAssignments' => function($query) {
                    $query->orderBy('time', 'asc');
                }, 'task.workingStep.project'])
                ->get()
                ->filter(function($taskWorker) {
                    return $taskWorker->task && 
                           $taskWorker->task->taskAssignments->isNotEmpty() &&
                           $taskWorker->task->completion_status !== 'completed';
                })
                ->map(function($taskWorker) {
                    $latestAssignment = $taskWorker->task->taskAssignments->first();
                    return [
                        'task_id' => $taskWorker->task->id,
                        'task_name' => $taskWorker->task->name,
                        'project_name' => $taskWorker->task->project_name,
                        'deadline' => $latestAssignment->time,
                        'status' => $taskWorker->task->status,
                    ];
                })
                ->sortBy('deadline')
                ->take(5)
                ->values()
            : collect([]);

        return Inertia::render('Company/Dashboard', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => [
                    'name' => $user->role,
                    'display_name' => ucfirst($user->role),
                    'description' => $user->role === 'company' ? 'Company Team Member' : ucfirst($user->role),
                ],
                'position' => $user->position ?? 'Staff',
            ],
            'statistics' => [
                'projects' => $projectStats,
                'tasks' => $taskStats,
                'projects_by_status' => $projectsByStatus,
            ],
            'recentProjects' => $recentProjects,
            'myActiveTasks' => $myActiveTasks,
            'taskTrend' => $taskTrend,
            'upcomingDeadlines' => $upcomingDeadlines,
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
                                'documents' => $latestAssignment->documents->map(function($doc) {
                                    return [
                                        'id' => $doc->id,
                                        'name' => $doc->name,
                                        'file' => $doc->file,
                                        'uploaded_at' => $doc->uploaded_at,
                                    ];
                                }),
                                'client_documents' => $latestAssignment->clientDocuments->map(function($clientDoc) {
                                    return [
                                        'id' => $clientDoc->id,
                                        'name' => $clientDoc->name,
                                        'description' => $clientDoc->description,
                                    ];
                                }),
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
        
        // Validate input - at least one of files or client_documents must be provided
        $request->validate([
            'notes' => 'nullable|string',
            'files.*' => 'nullable|file|max:10240', // Max 10MB per file
            'file_labels' => 'nullable|array',
            'file_labels.*' => 'nullable|string|max:255',
            'client_documents' => 'nullable|array',
            'client_documents.*.name' => 'required_with:client_documents|string',
            'client_documents.*.description' => 'nullable|string',
        ]);

        // Custom validation: at least one of files or client_documents must be provided
        $hasFiles = $request->hasFile('files');
        $hasClientDocs = $request->has('client_documents') && is_array($request->client_documents) && count($request->client_documents) > 0;
        
        if (!$hasFiles && !$hasClientDocs) {
            return back()->withErrors(['error' => 'Please upload at least one file or request at least one document from client.']);
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
        
        // Handle file uploads (if provided)
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
        
        // Handle client document requests (if provided)
        if ($request->has('client_documents') && is_array($request->client_documents)) {
            foreach ($request->client_documents as $clientDoc) {
                if (!empty($clientDoc['name'])) {
                    \App\Models\ClientDocument::create([
                        'task_assignment_id' => $taskAssignment->id,
                        'name' => $clientDoc['name'],
                        'slug' => \Illuminate\Support\Str::slug($clientDoc['name'] . '-' . time() . '-' . uniqid()),
                        'description' => $clientDoc['description'] ?? null,
                    ]);
                }
            }
        }
        
        // Determine status based on what was submitted
        $hasClientDocs = $request->has('client_documents') && is_array($request->client_documents) && count($request->client_documents) > 0;
        
        // Update task status - keep as "Submitted" until user clicks "Submit for Review"
        if ($task->status === 'Draft') {
            // Draft → Submitted (masih editable)
            if ($hasClientDocs) {
                $task->status = 'Submitted to Client'; // Client interaction path
            } else {
                $task->status = 'Submitted'; // Keep as Submitted, not auto-advance yet
            }
            $task->save();
        } elseif ($task->status === 'Client Reply') {
            // If client replied, keep as submitted
            $task->status = 'Submitted';
            $task->save();
        } elseif (str_contains($task->status, 'Returned for Revision')) {
            // If resubmitting after rejection, create new assignment but keep status
            // Status will change when user clicks "Submit for Review"
            // Don't auto-advance here, let user review first
        }
        
        // Update completion_status to in_progress when first submission is made
        if ($task->completion_status === 'pending') {
            $task->completion_status = 'in_progress';
            $task->save();
        }
        
        return back()->with('success', 'Task saved successfully! Click "Submit for Review" when ready.');
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

    /**
     * Submit task for review (move from Submitted → Under Review)
     */
    public function submitForReview(Request $request, Task $task)
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

        // Only allow submit if status is "Submitted" or "Returned for Revision"
        $canSubmit = $task->status === 'Submitted' || str_contains($task->status, 'Returned for Revision');
        
        if (!$canSubmit) {
            return back()->withErrors(['error' => 'Task cannot be submitted for review in its current status.']);
        }

        // Check if there's at least one assignment
        $hasAssignment = $task->taskAssignments()->exists();
        if (!$hasAssignment) {
            return back()->withErrors(['error' => 'Please save your work before submitting for review.']);
        }

        // Determine which reviewer to send to
        if (str_contains($task->status, 'Returned for Revision')) {
            // If resubmitting after rejection, go back to the reviewer who rejected it
            if (str_contains($task->status, 'Team Leader')) {
                $task->status = 'Under Review by Team Leader';
            } elseif (str_contains($task->status, 'Manager')) {
                $task->status = 'Under Review by Manager';
            } elseif (str_contains($task->status, 'Supervisor')) {
                $task->status = 'Under Review by Supervisor';
            } elseif (str_contains($task->status, 'Partner')) {
                $task->status = 'Under Review by Partner';
            }
        } else {
            // First submission, go to Team Leader
            $task->status = 'Under Review by Team Leader';
        }

        $task->save();

        return back()->with('success', 'Task submitted for review successfully!');
    }

    /**
     * Get approval requests for current user based on their role
     */
    public function getApprovalRequests(Project $project)
    {
        $user = Auth::user();
        
        // Get team member record to find role
        $teamMember = ProjectTeam::where('project_id', $project->id)
            ->where('user_id', $user->id)
            ->first();
            
        if (!$teamMember) {
            abort(403, 'You are not a member of this project.');
        }

        $role = $teamMember->role;
        
        // Map role to status (case-insensitive)
        $statusMap = [
            'team leader' => 'Under Review by Team Leader',
            'manager' => 'Under Review by Manager',
            'supervisor' => 'Under Review by Supervisor',
            'partner' => 'Under Review by Partner',
        ];
        
        $roleLower = strtolower($role);
        
        if (!isset($statusMap[$roleLower])) {
            return response()->json(['tasks' => []]);
        }
        
        $targetStatus = $statusMap[$roleLower];
        
        // Get all tasks in this project with the target status
        $tasks = Task::whereHas('workingStep', function($query) use ($project) {
                $query->where('project_id', $project->id);
            })
            ->where('status', $targetStatus)
            ->with([
                'workingStep',
                'taskAssignments' => function($q) {
                    $q->with(['documents', 'clientDocuments'])
                        ->orderBy('created_at', 'desc')
                        ->limit(1); // Only get latest assignment
                }
            ])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function($task) {
                $latestAssignment = $task->taskAssignments->first();
                
                return [
                    'id' => $task->id,
                    'name' => $task->name,
                    'slug' => $task->slug,
                    'status' => $task->status,
                    'completion_status' => $task->completion_status,
                    'working_step' => $task->workingStep ? [
                        'id' => $task->workingStep->id,
                        'name' => $task->workingStep->name,
                    ] : null,
                    'latest_assignment' => $latestAssignment ? [
                        'id' => $latestAssignment->id,
                        'time' => $latestAssignment->time,
                        'notes' => $latestAssignment->notes,
                        'created_at' => $latestAssignment->created_at,
                        'documents' => $latestAssignment->documents->map(function($doc) {
                            return [
                                'id' => $doc->id,
                                'name' => $doc->name,
                                'file' => $doc->file,
                            ];
                        }),
                        'client_documents' => $latestAssignment->clientDocuments->map(function($clientDoc) {
                            return [
                                'id' => $clientDoc->id,
                                'name' => $clientDoc->name,
                                'description' => $clientDoc->description,
                            ];
                        }),
                    ] : null,
                ];
            });
        
        return response()->json(['tasks' => $tasks]);
    }

    /**
     * Approve a task and advance to next status
     */
    public function approveTask(Request $request, Task $task)
    {
        $user = Auth::user();
        
        // Get team member to verify role
        $teamMember = ProjectTeam::where('project_id', $task->workingStep->project_id)
            ->where('user_id', $user->id)
            ->first();
            
        if (!$teamMember) {
            return response()->json(['error' => 'You are not a member of this project.'], 403);
        }

        $role = $teamMember->role;
        
        // Define approval workflow with auto-advance to next review (case-insensitive)
        $approvalWorkflow = [
            'team leader' => [
                'current' => 'Under Review by Team Leader',
                'approved' => 'Approved by Team Leader',
                'next_review' => 'Under Review by Manager', // Auto-advance
            ],
            'manager' => [
                'current' => 'Under Review by Manager',
                'approved' => 'Approved by Manager',
                'next_review' => 'Under Review by Supervisor', // Auto-advance
            ],
            'supervisor' => [
                'current' => 'Under Review by Supervisor',
                'approved' => 'Approved by Supervisor',
                'next_review' => 'Under Review by Partner', // Auto-advance
            ],
            'partner' => [
                'current' => 'Under Review by Partner',
                'approved' => 'Approved by Partner',
                'next_review' => null, // Final approval - no next review
            ],
        ];
        
        $roleLower = strtolower($role);
        
        if (!isset($approvalWorkflow[$roleLower]) || $task->status !== $approvalWorkflow[$roleLower]['current']) {
            return response()->json(['error' => 'You cannot approve this task in its current status.'], 403);
        }
        
        // Get workflow for current role
        $workflow = $approvalWorkflow[$roleLower];
        
        // Update task status - auto-advance to next review or mark as approved
        if ($workflow['next_review']) {
            // Auto-advance to next reviewer in hierarchy
            $task->status = $workflow['next_review'];
            $message = "Task approved and forwarded to next reviewer!";
        } else {
            // Final approval by Partner
            $task->status = $workflow['approved'];
            $task->completion_status = 'completed';
            $message = "Task approved and marked as completed!";
        }
        
        $task->save();
        
        // Mark latest assignment as approved
        $latestAssignment = $task->taskAssignments()->orderBy('created_at', 'desc')->first();
        if ($latestAssignment) {
            $latestAssignment->is_approved = true;
            $latestAssignment->save();
        }
        
        return response()->json(['success' => true, 'message' => $message]);
    }

    /**
     * Reject a task and send back for revision
     */
    public function rejectTask(Request $request, Task $task)
    {
        $user = Auth::user();
        
        // Get team member to verify role
        $teamMember = ProjectTeam::where('project_id', $task->workingStep->project_id)
            ->where('user_id', $user->id)
            ->first();
            
        if (!$teamMember) {
            return response()->json(['error' => 'You are not a member of this project.'], 403);
        }

        $role = $teamMember->role;
        
        // Verify user has permission to reject this status (case-insensitive)
        $rejectionMap = [
            'team leader' => ['current' => 'Under Review by Team Leader', 'rejected' => 'Returned for Revision by Team Leader'],
            'manager' => ['current' => 'Under Review by Manager', 'rejected' => 'Returned for Revision by Manager'],
            'supervisor' => ['current' => 'Under Review by Supervisor', 'rejected' => 'Returned for Revision by Supervisor'],
            'partner' => ['current' => 'Under Review by Partner', 'rejected' => 'Returned for Revision by Partner'],
        ];
        
        $roleLower = strtolower($role);
        
        if (!isset($rejectionMap[$roleLower]) || $task->status !== $rejectionMap[$roleLower]['current']) {
            return response()->json(['error' => 'You cannot reject this task in its current status.'], 403);
        }
        
        $request->validate([
            'comment' => 'required|string',
        ]);
        
        // Update task status
        $task->status = $rejectionMap[$roleLower]['rejected'];
        $task->save();
        
        // Add rejection comment to latest assignment
        $latestAssignment = $task->taskAssignments()->orderBy('created_at', 'desc')->first();
        if ($latestAssignment) {
            $latestAssignment->comment = $request->comment;
            $latestAssignment->is_approved = false;
            $latestAssignment->save();
        }
        
        return response()->json(['success' => true, 'message' => 'Task rejected and returned for revision.']);
    }
}
