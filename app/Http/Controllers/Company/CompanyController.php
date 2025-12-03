<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ProjectTeam;
use App\Models\WorkingStep;
use App\Models\Task;
use App\Models\News;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
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
            'in_progress' => ProjectTeam::where('user_id', $user->id)
                ->whereHas('project', function($query) {
                    $query->where('status', 'In Progress');
                })
                ->count(),
            'completed' => ProjectTeam::where('user_id', $user->id)
                ->whereHas('project', function($query) {
                    $query->where('status', 'Completed');
                })
                ->count(),
            'archived' => ProjectTeam::where('user_id', $user->id)
                ->whereHas('project', function($query) {
                    $query->where('is_archived', true);
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
        
        // 3. Recent Projects (last 10)
        $recentProjects = Project::whereHas('projectTeams', function($query) use ($user) {
            $query->where('user_id', $user->id);
        })
        ->with(['projectTeams' => function($query) use ($user) {
            $query->where('user_id', $user->id);
        }])
        ->orderBy('created_at', 'desc')
        ->limit(10)
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
                    $query->with(['workingStep.project', 'taskAssignments' => function($q) {
                        $q->latest();
                    }])
                        ->where('completion_status', '!=', 'completed');
                }])
                ->get()
                ->filter(function($taskWorker) {
                    return $taskWorker->task !== null;
                })
                ->map(function($taskWorker) {
                    $latestAssignment = $taskWorker->task->taskAssignments->first();
                    return [
                        'id' => $taskWorker->task->id,
                        'name' => $taskWorker->task->name,
                        'project_id' => $taskWorker->task->workingStep->project_id,
                        'project_name' => $taskWorker->task->project_name,
                        'working_step_name' => $taskWorker->task->working_step_name,
                        'completion_status' => $taskWorker->task->completion_status,
                        'status' => $latestAssignment->status ?? 'Draft',
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
                        'status' => $latestAssignment->status ?? 'Draft',
                    ];
                })
                ->sortBy('deadline')
                ->take(5)
                ->values()
            : collect([]);

        // Get latest published news
        $latestNews = News::published()
            ->with('creator')
            ->orderBy('published_at', 'desc')
            ->take(3)
            ->get()
            ->map(function ($news) {
                return [
                    'id' => $news->id,
                    'title' => $news->title,
                    'slug' => $news->slug,
                    'excerpt' => $news->excerpt,
                    'featured_image' => $news->featured_image,
                    'published_at' => $news->published_at,
                    'creator' => [
                        'name' => $news->creator->name,
                    ],
                ];
            });

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
            'latestNews' => $latestNews,
        ]);
    }

    /**
     * Show list of projects for this company user
     */
    public function myProjects(Request $request)
    {
        $user = Auth::user();
        
        // Get filters from request
        $status = $request->input('status', 'In Progress'); // Default to 'In Progress'
        $search = $request->input('search', '');
        
        // Get projects where user is a team member
        $query = Project::whereHas('projectTeams', function($q) use ($user) {
            $q->where('user_id', $user->id);
        })
        ->with(['projectTeams' => function($query) use ($user) {
            $query->where('user_id', $user->id);
        }]);
        
        // Apply status filter - exclude archived projects
        if ($status === 'Archived') {
            $query->where('is_archived', true);
        } else {
            $query->where('status', $status)
                  ->where('is_archived', false);
        }
        
        // Apply search filter
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                  ->orWhere('client_name', 'like', '%' . $search . '%');
            });
        }
        
        $projects = $query->orderBy('created_at', 'desc')
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
        
        // Get status counts
        $statusCounts = [
            'in_progress' => Project::whereHas('projectTeams', function($q) use ($user) {
                $q->where('user_id', $user->id);
            })->where('status', 'In Progress')->where('is_archived', false)->count(),
            'completed' => Project::whereHas('projectTeams', function($q) use ($user) {
                $q->where('user_id', $user->id);
            })->where('status', 'Completed')->where('is_archived', false)->count(),
            'suspended' => Project::whereHas('projectTeams', function($q) use ($user) {
                $q->where('user_id', $user->id);
            })->where('status', 'Suspended')->where('is_archived', false)->count(),
            'canceled' => Project::whereHas('projectTeams', function($q) use ($user) {
                $q->where('user_id', $user->id);
            })->where('status', 'Canceled')->where('is_archived', false)->count(),
            'archived' => Project::whereHas('projectTeams', function($q) use ($user) {
                $q->where('user_id', $user->id);
            })->where('is_archived', true)->count(),
        ];

        return Inertia::render('Company/Projects/Index', [
            'projects' => $projects,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
            'statusCounts' => $statusCounts,
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
                        
                        // Check if task can be edited (only if status is pending at lowest approval level OR rejected)
                        $canEdit = false;
                        if ($myAssignment && $latestAssignment) {
                            // Get lowest order approval (first approval in workflow)
                            $lowestApproval = $task->taskApprovals()
                                ->orderBy('order', 'asc')
                                ->first();
                            
                            // DEBUG: Log status for debugging
                            Log::info('Task Can Edit Check', [
                                'task_id' => $task->id,
                                'task_name' => $task->name,
                                'current_status' => $latestAssignment->status,
                                'lowest_approval_pending' => $lowestApproval ? $lowestApproval->status_name_pending : null,
                            ]);
                            
                            if ($lowestApproval) {
                                // Can edit if:
                                // 1. Status matches pending of lowest approval, OR
                                // 2. Status is rejected (any reject status from any approval level)
                                $canEdit = $latestAssignment->status === $lowestApproval->status_name_pending;
                                
                                // Also check if status is any reject status from any approval level
                                if (!$canEdit) {
                                    // Check by status_name_reject column
                                    $isRejected = $task->taskApprovals()
                                        ->where('status_name_reject', $latestAssignment->status)
                                        ->exists();
                                    
                                    // Also check by string pattern "Returned for Revision" (legacy/hardcoded statuses)
                                    if (!$isRejected) {
                                        $isRejected = str_contains($latestAssignment->status, 'Returned for Revision') ||
                                                     str_contains($latestAssignment->status, 'Rejected');
                                    }
                                    
                                    Log::info('Rejection Check', [
                                        'task_id' => $task->id,
                                        'is_rejected' => $isRejected,
                                        'status' => $latestAssignment->status,
                                    ]);
                                    
                                    $canEdit = $isRejected;
                                }
                            } else {
                                // No approval workflow - can edit if status is Draft or Submitted
                                $canEdit = in_array($latestAssignment->status, ['Draft', 'Submitted']);
                            }
                        }
                        
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
                            'is_assigned_to_me' => $myAssignment !== null,
                            'my_assignment_id' => $myAssignment ? $myAssignment->id : null,
                            'can_edit' => $canEdit,
                            // Latest assignment info for display
                            'latest_assignment' => $latestAssignment ? [
                                'id' => $latestAssignment->id,
                                'time' => $latestAssignment->time,
                                'notes' => $latestAssignment->notes,
                                'comment' => $latestAssignment->comment,
                                'client_comment' => $latestAssignment->client_comment,
                                'status' => $latestAssignment->status,
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
                                        'file' => $clientDoc->file,
                                        'uploaded_at' => $clientDoc->uploaded_at,
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
                                    'status' => $assignment->status,
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

        // Get all team members for this project
        $teamMembers = ProjectTeam::where('project_id', $project->id)
            ->orderBy('role')
            ->orderBy('user_name')
            ->get()
            ->map(function($member) {
                return [
                    'id' => $member->id,
                    'user_id' => $member->user_id,
                    'user_name' => $member->user_name,
                    'user_email' => $member->user_email,
                    'user_position' => $member->user_position,
                    'role' => $member->role,
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
            'teamMembers' => $teamMembers,
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

        // Get or create TaskAssignment
        // Check if task can be edited (only if at lowest approval level pending)
        $taskAssignment = $task->taskAssignments()->latest()->first();
        
        $currentStatus = $taskAssignment->status ?? 'Draft';
        
        // Determine if this is editable (UPDATE) or new submission (CREATE)
        $isEditable = false;
        $lowestApproval = $task->taskApprovals()->orderBy('order', 'asc')->first();
        
        if ($lowestApproval) {
            // Has approval workflow
            // Editable (UPDATE) only if status matches lowest pending
            // If rejected, will CREATE new assignment
            $isEditable = $currentStatus === $lowestApproval->status_name_pending;
        } else {
            // No approval workflow - editable if Draft or Submitted
            $isEditable = in_array($currentStatus, ['Draft', 'Submitted', 'Submitted to Client']);
        }
        
        // Custom validation: at least one of files or client_documents must be provided
        // UNLESS editing existing assignment (which already has files)
        $hasFiles = $request->hasFile('files');
        $hasClientDocs = $request->has('client_documents') && is_array($request->client_documents) && count($request->client_documents) > 0;
        $hasExistingData = $taskAssignment && ($taskAssignment->documents()->count() > 0 || $taskAssignment->clientDocuments()->count() > 0);
        
        if (!$hasFiles && !$hasClientDocs && !$hasExistingData) {
            return back()->withErrors(['error' => 'Please upload at least one file or request at least one document from client.']);
        }
        
        if ($taskAssignment && $isEditable) {
            // UPDATE existing assignment (edit mode for Draft/Submitted)
            $taskAssignment->update([
                'notes' => $request->notes,
                'time' => now(),
            ]);
            
            // Update existing document labels if provided (without uploading new files)
            if ($request->has('existing_document_labels') && is_array($request->existing_document_labels)) {
                foreach ($request->existing_document_labels as $docLabel) {
                    if (isset($docLabel['doc_id']) && isset($docLabel['label'])) {
                        $document = \App\Models\Document::find($docLabel['doc_id']);
                        if ($document && $document->task_assignment_id == $taskAssignment->id) {
                            $document->update([
                                'name' => $docLabel['label'],
                                'slug' => \Illuminate\Support\Str::slug($docLabel['label'] . '-' . time() . '-' . uniqid()),
                            ]);
                        }
                    }
                }
            }
            
            // Only delete old documents if new files are being uploaded
            if ($hasFiles) {
                $taskAssignment->documents()->delete();
            }
            
            // Only delete old client documents if new requests are being made
            if ($hasClientDocs) {
                $taskAssignment->clientDocuments()->delete();
            }
        } else {
            // CREATE new assignment (first time or after rejection)
            $taskAssignment = \App\Models\TaskAssignment::create([
                'task_id' => $task->id,
                'task_name' => $task->name,
                'working_step_name' => $task->working_step_name,
                'project_name' => $task->project_name,
                'project_client_name' => $task->project_client_name,
                'time' => now(),
                'notes' => $request->notes,
                'comment' => null, // Will be filled by reviewer if rejected
                'status' => 'Draft', // Initial status
            ]);
        }
        
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
        
        // Get the assignment we just created/updated
        $latestAssignment = $task->taskAssignments()->latest()->first();
        
        // Store hasClientDocs flag in assignment for later use after approvals
        // Note: We'll check this flag when final approval happens
        
        // AUTO-SUBMIT to approval workflow - ALWAYS go through approval first
        if ($currentStatus === 'Draft') {
            // Get first approval in workflow (lowest order)
            $firstApproval = $task->taskApprovals()->orderBy('order', 'asc')->first();
            
            if ($firstApproval) {
                // ALWAYS submit to first approval level first, regardless of client interaction
                $latestAssignment->status = $firstApproval->status_name_pending;
            } else {
                // No approval workflow - check if needs client interaction
                if ($hasClientDocs) {
                    $latestAssignment->status = 'Submitted to Client';
                } else {
                    // No approval, no client interaction - mark as completed
                    $latestAssignment->status = 'Completed';
                    $task->completed_at = now();
                    $task->markAsCompleted(); // Use method to trigger unlock logic
                }
            }
            $latestAssignment->save();
        } elseif ($currentStatus === 'Client Reply') {
            // If client replied, auto-submit to first approval
            $firstApproval = $task->taskApprovals()->orderBy('order', 'asc')->first();
            if ($firstApproval) {
                $latestAssignment->status = $firstApproval->status_name_pending;
            } else {
                $latestAssignment->status = 'Completed';
            }
            $latestAssignment->save();
        } elseif (str_contains($currentStatus, 'Returned for Revision')) {
            // If resubmitting after rejection, go back to the approver who rejected it
            if (str_contains($currentStatus, 'Team Leader')) {
                $approval = $task->taskApprovals()->where('role', 'team leader')->first();
                $latestAssignment->status = $approval ? $approval->status_name_pending : 'Pending Team Leader';
            } elseif (str_contains($currentStatus, 'Manager')) {
                $approval = $task->taskApprovals()->where('role', 'manager')->first();
                $latestAssignment->status = $approval ? $approval->status_name_pending : 'Pending Manager';
            } elseif (str_contains($currentStatus, 'Supervisor')) {
                $approval = $task->taskApprovals()->where('role', 'supervisor')->first();
                $latestAssignment->status = $approval ? $approval->status_name_pending : 'Pending Supervisor';
            } elseif (str_contains($currentStatus, 'Partner')) {
                $approval = $task->taskApprovals()->where('role', 'partner')->first();
                $latestAssignment->status = $approval ? $approval->status_name_pending : 'Pending Partner';
            }
            $latestAssignment->save();
        }
        
        // Update completion_status to in_progress when first submission is made
        if ($task->completion_status === 'pending') {
            $task->completion_status = 'in_progress';
            $task->save();
        }
        
        return back()->with('success', 'Task submitted successfully!');
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

        $role = strtolower($teamMember->role);
        
        // Get all tasks in this project that have approvals for this role
        // and where the LATEST ASSIGNMENT status matches the pending status
        $tasks = Task::whereHas('workingStep', function($query) use ($project) {
                $query->where('project_id', $project->id);
            })
            ->whereHas('taskApprovals', function($query) use ($role) {
                // Task must have approval workflow for this role
                $query->where('role', $role);
            })
            ->get()
            ->filter(function($task) use ($role) {
                // Filter tasks where latest assignment status matches this role's pending OR progress status
                $latestAssignment = $task->taskAssignments()->latest()->first();
                if (!$latestAssignment) {
                    return false;
                }
                
                // Get the approval for this role
                $approval = $task->taskApprovals()->where('role', $role)->first();
                if (!$approval) {
                    return false;
                }
                
                // Check if current status matches pending OR progress status for this role
                return $latestAssignment->status === $approval->status_name_pending ||
                       $latestAssignment->status === $approval->status_name_progress;
            })
            ->load([
                'workingStep',
                'taskAssignments' => function($q) {
                    $q->with(['documents', 'clientDocuments'])
                        ->orderBy('created_at', 'desc')
                        ->limit(1); // Only get latest assignment
                }
            ])
            ->sortByDesc('created_at')
            ->values()
            ->map(function($task) {
                $latestAssignment = $task->taskAssignments->first();
                
                return [
                    'id' => $task->id,
                    'name' => $task->name,
                    'slug' => $task->slug,
                    'status' => $latestAssignment->status ?? 'Draft',
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
     * Show approval detail page for a specific task
     */
    public function showApprovalDetail(Task $task)
    {
        $user = Auth::user();
        
        // Get team member to verify role
        $teamMember = ProjectTeam::where('project_id', $task->workingStep->project_id)
            ->where('user_id', $user->id)
            ->first();
            
        if (!$teamMember) {
            abort(403, 'You are not a member of this project.');
        }

        $role = strtolower($teamMember->role);
        
        // Verify this task has approval for this role
        $approval = $task->taskApprovals()->where('role', $role)->first();
        
        if (!$approval) {
            abort(403, 'You are not part of the approval workflow for this task.');
        }
        
        // Verify current status matches the pending OR progress status for this role
        $latestAssignment = $task->taskAssignments()->latest()->first();
        
        if (!$latestAssignment || 
            ($latestAssignment->status !== $approval->status_name_pending && 
             $latestAssignment->status !== $approval->status_name_progress)) {
            abort(403, 'This task is not waiting for your approval.');
        }
        $latestAssignment->maker_can_edit = false;
        
        // Update status from pending to in-progress when detail page is opened (only if still pending)
        if ($latestAssignment->status === $approval->status_name_pending) {
            $latestAssignment->status = $approval->status_name_progress;
            $latestAssignment->save();
        }
        
        // Load task with relationships
        $task->load([
            'workingStep',
            'taskAssignments' => function($q) {
                $q->with(['documents', 'clientDocuments'])
                    ->orderBy('created_at', 'desc')
                    ->limit(1);
            }
        ]);
        
        $taskData = [
            'id' => $task->id,
            'name' => $task->name,
            'slug' => $task->slug,
            'status' => $latestAssignment->status,
            'completion_status' => $task->completion_status,
            'working_step' => [
                'id' => $task->workingStep->id,
                'name' => $task->workingStep->name,
            ],
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
        
        $projectData = [
            'id' => $task->workingStep->project_id,
            'name' => $task->project_name,
            'slug' => $task->project->slug ?? '',
        ];
        
        return Inertia::render('Company/Tasks/ApprovalDetail', [
            'task' => $taskData,
            'project' => $projectData,
        ]);
    }

    /**
     * Show task detail page
     */
    public function showTaskDetail(Task $task)
    {
        // dd('hit');
        $user = Auth::user();
        
        // Get team member to verify access
        $teamMember = ProjectTeam::where('project_id', $task->workingStep->project_id)
            ->where('user_id', $user->id)
            ->first();
            
        if (!$teamMember) {
            abort(403, 'You are not a member of this project.');
        }

        // Get latest assignment
        $latestAssignment = $task->taskAssignments()->orderBy('created_at', 'desc')->first();
        if ($latestAssignment->maker === 'client') {
            $latestAssignment->maker_can_edit = false;
        }
        
        // Check if task can be edited
        $canEdit = false;
        $lowestApproval = $task->taskApprovals()->orderBy('order', 'asc')->first();
        
        if ($lowestApproval && $latestAssignment) {
            // Can edit if at lowest approval pending
            $canEdit = $latestAssignment->status === $lowestApproval->status_name_pending;
            
            // Or if rejected at any level
            if (!$canEdit) {
                $isRejected = $task->taskApprovals()
                    ->where('status_name_reject', $latestAssignment->status)
                    ->exists();
                    
                // Fallback for hardcoded statuses
                if (!$isRejected) {
                    $isRejected = str_contains($latestAssignment->status, 'Returned for Revision') ||
                                 str_contains($latestAssignment->status, 'Rejected');
                }
                
                $canEdit = $isRejected;
            }
        } elseif (!$latestAssignment) {
            // First submission
            $canEdit = true;
        }

        // Build task data
        $taskData = [
            'id' => $task->id,
            'name' => $task->name,
            'slug' => $task->slug,
            'status' => $latestAssignment ? $latestAssignment->status : 'Draft',
            'completion_status' => $task->completion_status,
            'client_interact' => $task->client_interact,
            'multiple_files' => $task->multiple_files,
            'can_edit' => $canEdit,
            'working_step' => [
                'id' => $task->workingStep->id,
                'name' => $task->workingStep->name,
            ],
            'latest_assignment' => $latestAssignment ? [
                'id' => $latestAssignment->id,
                'time' => $latestAssignment->time,
                'notes' => $latestAssignment->notes,
                'comment' => $latestAssignment->comment,
                'client_comment' => $latestAssignment->client_comment,
                'status' => $latestAssignment->status,
                'created_at' => $latestAssignment->created_at,
                'documents' => $latestAssignment->documents->map(function($doc) {
                    return [
                        'id' => $doc->id,
                        'name' => $doc->name,
                        'file' => $doc->file,
                        'uploaded_at' => $doc->created_at,
                    ];
                }),
                'client_documents' => $latestAssignment->clientDocuments->map(function($doc) {
                    return [
                        'id' => $doc->id,
                        'name' => $doc->name,
                        'description' => $doc->description,
                        'file' => $doc->file,
                        'uploaded_at' => $doc->updated_at,
                    ];
                }),
            ] : null,
            'assignments' => $task->taskAssignments()->orderBy('created_at', 'desc')->get()->map(function($assignment) {
                return [
                    'id' => $assignment->id,
                    'time' => $assignment->time,
                    'notes' => $assignment->notes,
                    'comment' => $assignment->comment,
                    'client_comment' => $assignment->client_comment,
                    'status' => $assignment->status,
                    'created_at' => $assignment->created_at,
                    'documents' => $assignment->documents->map(function($doc) {
                        return [
                            'id' => $doc->id,
                            'name' => $doc->name,
                            'file' => $doc->file,
                            'uploaded_at' => $doc->created_at,
                        ];
                    }),
                    'client_documents' => $assignment->clientDocuments->map(function($doc) {
                        return [
                            'id' => $doc->id,
                            'name' => $doc->name,
                            'description' => $doc->description,
                            'file' => $doc->file,
                            'uploaded_at' => $doc->updated_at,
                        ];
                    }),
                ];
            }),
        ];

        // Build project data
        $projectData = [
            'id' => $task->workingStep->project->id,
            'name' => $task->workingStep->project->name,
            'slug' => $task->workingStep->project->slug,
        ];

        return Inertia::render('Company/Tasks/TaskDetail', [
            'task' => $taskData,
            'project' => $projectData,
        ]);
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
            return redirect()->back()->with('error', 'You are not a member of this project.');
        }

        $role = strtolower($teamMember->role);
        
        // Get latest assignment
        $latestAssignment = $task->taskAssignments()->orderBy('created_at', 'desc')->first();
        
        if (!$latestAssignment) {
            return redirect()->back()->with('error', 'No assignment found for this task.');
        }
        
        // Get current approval from task_approvals based on current role
        $currentApproval = $task->taskApprovals()
            ->where('role', $role)
            ->first();
            
        if (!$currentApproval) {
            return redirect()->back()->with('error', 'You are not part of the approval workflow for this task.');
        }
        
        // Verify current status matches the pending OR progress status for this approval
        if ($latestAssignment->status !== $currentApproval->status_name_pending && 
            $latestAssignment->status !== $currentApproval->status_name_progress) {
            return redirect()->back()->with('error', 'You cannot approve this task in its current status.');
        }
        
        // Get next approval in workflow (higher order)
        $nextApproval = $task->taskApprovals()
            ->where('order', '>', $currentApproval->order)
            ->orderBy('order', 'asc')
            ->first();
        
        if ($nextApproval) {
            // Auto-advance to next approval level
            $latestAssignment->status = $nextApproval->status_name_pending;
            $latestAssignment->save();
            $message = "Task approved and forwarded to next reviewer!";
        } else {
            // Final approval - check if task needs client interaction
            $hasClientDocs = $latestAssignment->clientDocuments()->count() > 0;
            
            if ($hasClientDocs) {
                // Has client documents to upload - send to client
                $latestAssignment->status = 'Submitted to Client';
                $latestAssignment->save();
                $message = "Task approved! Waiting for client to upload requested documents.";
            } else {
                // No client interaction needed - mark as completed
                // $latestAssignment->status = $currentApproval->status_name_complete;
                $latestAssignment->status = 'Submitted to Client';
                $latestAssignment->save();
                
                $task->completed_at = now();
                $task->markAsCompleted(); // Use method to trigger unlock logic
                
                $message = "Task approved and marked as completed!";
            }
        }
        
        // Redirect to project page after successful approve
        $projectId = $task->workingStep->project_id;
        return redirect()->route('company.projects.show', $projectId)
            ->with('success', $message);
    }

    /**
     * Reject a task and send back for revision
     */
    public function rejectTask(Request $request, Task $task)
    {
        try {
            $user = Auth::user();
            
            // Get team member to verify role
            $teamMember = ProjectTeam::where('project_id', $task->workingStep->project_id)
                ->where('user_id', $user->id)
                ->first();
                
            if (!$teamMember) {
                return redirect()->back()->with('error', 'You are not a member of this project.');
            }

            $role = strtolower($teamMember->role);
            
            
            // Get latest assignment
            $latestAssignment = $task->taskAssignments()->orderBy('created_at', 'desc')->first();
            
            if (!$latestAssignment) {
                return redirect()->back()->with('error', 'No assignment found for this task.');
            }
            
            // Get current approval from task_approvals based on current role
            $currentApproval = $task->taskApprovals()
                ->where('role', $role)
                ->first();
                
            if (!$currentApproval) {
                return redirect()->back()->with('error', 'You are not part of the approval workflow for this task.');
            }
            
            
            // Verify current status matches the pending OR progress status for this approval
            if ($latestAssignment->status !== $currentApproval->status_name_pending && 
                $latestAssignment->status !== $currentApproval->status_name_progress) {
                return redirect()->back()->with('error', 'You cannot reject this task in its current status.');
            }
            
            $request->validate([
                'comment' => 'required|string',
            ]);
            
            // Update assignment status to rejected status
            $latestAssignment->status = $currentApproval->status_name_reject;
            $latestAssignment->comment = $request->comment;
            $latestAssignment->save();
            
            // Redirect to project page after successful reject
            $projectId = $task->workingStep->project_id;
            return redirect()->route('company.projects.show', $projectId)
                ->with('success', 'Task rejected and returned for revision.');
        } catch (\Exception $e) {
            Log::error('Error rejecting task:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return redirect()->back()->with('error', 'Failed to reject task: ' . $e->getMessage());
        }
    }

    /**
     * Accept client documents and mark task as ready for review
     */
    public function acceptClientDocuments(Request $request, Task $task)
    {
        $user = Auth::user();
        
        // Check if user is assigned to this task
        $taskWorker = \App\Models\TaskWorker::where('task_id', $task->id)
            ->whereHas('projectTeam', function($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->first();
            
        if (!$taskWorker) {
            return back()->with('error', 'You are not assigned to this task.');
        }

        // Get latest assignment
        $latestAssignment = $task->taskAssignments()->latest()->first();
        
        if (!$latestAssignment) {
            return back()->with('error', 'No assignment found for this task.');
        }

        // Verify task assignment status is "Client Reply"
        if ($latestAssignment->status !== 'Client Reply') {
            return back()->with('error', 'Task is not in Client Reply status.');
        }

        // Verify all client documents have been uploaded
        $clientDocuments = $latestAssignment->clientDocuments;
        $allUploaded = $clientDocuments->every(function($doc) {
            return $doc->file !== null;
        });

        if (!$allUploaded) {
            return back()->with('error', 'Not all client documents have been uploaded yet.');
        }

        // Update assignment status to "Submitted" (ready for approval workflow)
        $latestAssignment->status = 'Completed';
        $latestAssignment->save();
        
        // Mark task as completed
        $task->markAsCompleted(); // Use method to trigger unlock logic

        // Log activity
        \App\Models\ActivityLog::create([
            'user_id' => Auth::id(),
            'user_name' => Auth::user()->name,
            'action_type' => 'task_status',
            'action' => 'accepted_client_documents',
            'target_name' => $task->name,
            'description' => "Accepted client documents for task: {$task->name}",
            'meta' => json_encode([
                'task_id' => $task->id,
                'previous_status' => 'Client Reply',
                'new_status' => 'Completed',
            ]),
        ]);

        return back()->with('success', 'Client documents accepted. Task marked as completed and ready for review.');
    }

    /**
     * Request client to re-upload documents (creates new assignment)
     */
    public function requestReupload(Request $request, Task $task)
    {
        $user = Auth::user();
        
        // Check if user is assigned to this task
        $taskWorker = \App\Models\TaskWorker::where('task_id', $task->id)
            ->whereHas('projectTeam', function($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->first();
            
        if (!$taskWorker) {
            return back()->with('error', 'You are not assigned to this task.');
        }

        // Get latest assignment
        $latestAssignment = $task->taskAssignments()->latest()->first();
        
        if (!$latestAssignment) {
            return back()->with('error', 'No assignment found for this task.');
        }

        // Verify task assignment status is "Client Reply"
        if ($latestAssignment->status !== 'Client Reply') {
            return back()->with('error', 'Task is not in Client Reply status.');
        }

        $request->validate([
            'comment' => 'required|string|max:1000',
        ]);

        // Create NEW task assignment (old one remains for history)
        $newAssignment = \App\Models\TaskAssignment::create([
            'task_id' => $task->id,
            'user_id' => $user->id,
            'task_name' => $task->name,
            'working_step_name' => $task->working_step_name,
            'project_name' => $task->project_name,
            'project_client_name' => $task->project_client_name,
            'time' => now(),
            'notes' => "Re-upload requested\nComment:\n" . $request->comment,
            'maker' => 'client',
            'status' => 'Submitted to Client', // Set status to request re-upload from client
        ]);

        // Copy team documents to new assignment (WITH files - keep team's uploaded documents)
        $oldDocuments = $latestAssignment->documents;
        foreach ($oldDocuments as $oldDoc) {
            \App\Models\Document::create([
                'task_assignment_id' => $newAssignment->id,
                'name' => $oldDoc->name,
                'slug' => \Illuminate\Support\Str::slug($oldDoc->name . '-' . time() . '-' . uniqid()),
                'file' => $oldDoc->file, // Copy same file path - team's documents preserved
                'uploaded_at' => $oldDoc->uploaded_at,
            ]);
        }

        // Copy client document requests to new assignment (WITHOUT files - client needs to re-upload)
        $oldClientDocuments = $latestAssignment->clientDocuments;
        foreach ($oldClientDocuments as $oldDoc) {
            \App\Models\ClientDocument::create([
                'task_assignment_id' => $newAssignment->id,
                'name' => $oldDoc->name,
                'slug' => \Illuminate\Support\Str::slug($oldDoc->name . '-' . time() . '-' . uniqid()),
                'description' => $oldDoc->description,
                'file' => null, // No file - client needs to upload again
                'uploaded_at' => null,
            ]);
        }

        // Note: Task status is now managed through task_assignments
        // No need to update task.status anymore

        // Log activity
        \App\Models\ActivityLog::create([
            'user_id' => Auth::id(),
            'user_name' => Auth::user()->name,
            'action_type' => 'task_status',
            'action' => 'requested_reupload',
            'target_name' => $task->name,
            'description' => "Requested client to re-upload documents for task: {$task->name}",
            'meta' => json_encode([
                'task_id' => $task->id,
                'comment' => $request->comment,
                'previous_assignment_id' => $latestAssignment->id,
                'new_assignment_id' => $newAssignment->id,
            ]),
        ]);

        return back()->with('success', 'Re-upload request sent to client. Previous submission kept in history.');
    }
}
