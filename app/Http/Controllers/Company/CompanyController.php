<?php

namespace App\Http\Controllers\Company;

use App\Events\NewApprovalNotification;
use App\Events\NewClientTaskNotification;
use App\Events\NewWorkerTaskNotification;
use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ProjectTeam;
use App\Models\WorkingStep;
use App\Models\Task;
use App\Models\TaskWorker;
use App\Models\News;
use App\Models\User;
use App\Services\SafeTransactionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
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
        $inProgressCount = ProjectTeam::where('user_id', $user->id)
            ->whereHas('project', function($query) {
                $query->where('status', 'In Progress');
            })
            ->count();
            
        $completedCount = ProjectTeam::where('user_id', $user->id)
            ->whereHas('project', function($query) {
                $query->where('status', 'Completed');
            })
            ->count();
            
        $suspendedCount = ProjectTeam::where('user_id', $user->id)
            ->whereHas('project', function($query) {
                $query->where('status', 'Suspended');
            })
            ->count();
            
        $canceledCount = ProjectTeam::where('user_id', $user->id)
            ->whereHas('project', function($query) {
                $query->where('status', 'Canceled');
            })
            ->count();
            
        $draftCount = ProjectTeam::where('user_id', $user->id)
            ->whereHas('project', function($query) {
                $query->where('status', 'Draft');
            })
            ->count();
            
        $projectStats = [
            'total' => ProjectTeam::where('user_id', $user->id)->count(),
            'active' => $inProgressCount, // In Progress = Active
            'closed' => $completedCount + $suspendedCount + $canceledCount, // All finished states
            'draft' => $draftCount,
            'in_progress' => $inProgressCount,
            'completed' => $completedCount,
            'suspended' => $suspendedCount,
            'canceled' => $canceledCount,
            'archived' => ProjectTeam::where('user_id', $user->id)
                ->whereHas('project', function ($query) {
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
                ->whereHas('task', function ($query) {
                    $query->where('completion_status', 'completed');
                })
                ->count()
                : 0,
            'in_progress' => $hasProjects
                ? \App\Models\TaskWorker::whereIn('project_team_id', $projectTeamIds)
                ->whereHas('task', function ($query) {
                    $query->where('completion_status', 'in_progress');
                })
                ->count()
                : 0,
            'pending' => $hasProjects
                ? \App\Models\TaskWorker::whereIn('project_team_id', $projectTeamIds)
                ->whereHas('task', function ($query) {
                    $query->where('completion_status', 'pending');
                })
                ->count()
                : 0,
        ];

        // 3. Recent Projects (last 10) - exclude Draft projects
        $recentProjects = Project::whereHas('projectTeams', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })
            ->where('status', '!=', 'Draft')
            ->with(['projectTeams' => function ($query) use ($user) {
                $query->where('user_id', $user->id);
            }])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($project) {
                return [
                    'id' => $project->id,
                    'name' => $project->name,
                    'client_name' => $project->client_name,
                    'status' => $project->status,
                    'my_role' => $project->projectTeams->first()->role ?? 'member',
                    'created_at' => $project->created_at->format('Y-m-d H:i:s'),
                ];
            });

        // 4. My Assigned Tasks (tasks assigned to me via task_workers - not completed, ordered by newest)
        $myAssignedTasks = $hasProjects
            ? \App\Models\TaskWorker::whereIn('project_team_id', $projectTeamIds)
            ->with(['task' => function ($query) {
                $query->with(['workingStep', 'taskAssignments' => function ($q) {
                    $q->latest();
                }])
                    ->where('completion_status', '!=', 'completed');
            }])
            ->latest('created_at')
            ->get()
            ->filter(function ($taskWorker) {
                return $taskWorker->task !== null;
            })
            ->map(function ($taskWorker) {
                $latestAssignment = $taskWorker->task->taskAssignments->first();
                return [
                    'id' => $taskWorker->task->id,
                    'name' => $taskWorker->task->name,
                    'project_id' => $taskWorker->task->project_id,
                    'project_name' => $taskWorker->task->project_name,
                    'working_step_name' => $taskWorker->task->working_step_name,
                    'completion_status' => $taskWorker->task->completion_status,
                    'status' => $latestAssignment->status ?? 'Draft',
                    'is_required' => $taskWorker->task->is_required,
                    'created_at' => $taskWorker->created_at,
                ];
            })
            ->take(10)
            : collect([]);

        // 5. Tasks Pending My Approval (based on user's role in projects)
        $myRoles = $hasProjects
            ? ProjectTeam::where('user_id', $user->id)
            ->pluck('role', 'project_id')
            ->toArray()
            : [];

        $tasksPendingApproval = $hasProjects && !empty($myRoles)
            ? \App\Models\TaskApproval::whereIn('role', array_values($myRoles))
            ->with(['task' => function ($query) {
                $query->with(['workingStep', 'taskAssignments' => function ($q) {
                    $q->latest();
                }]);
            }])
            ->get()
            ->filter(function ($approval) use ($myRoles) {
                if (!$approval->task) return false;

                // Check if user has the required role in this project
                $projectId = $approval->task->project_id;
                $userRoleInProject = $myRoles[$projectId] ?? null;

                if ($userRoleInProject !== $approval->role) return false;

                // Check if task needs approval from this role
                $latestAssignment = $approval->task->taskAssignments->first();
                $currentStatus = $latestAssignment->status ?? 'Draft';

                // Task is pending approval if status matches either "pending" or "progress" status for this role
                return $currentStatus === $approval->status_name_pending
                    || $currentStatus === $approval->status_name_progress;
            })
            ->map(function ($approval) {
                $latestAssignment = $approval->task->taskAssignments->first();
                return [
                    'id' => $approval->task->id,
                    'approval_id' => $approval->id,
                    'name' => $approval->task->name,
                    'project_id' => $approval->task->project_id,
                    'project_name' => $approval->task->project_name,
                    'working_step_name' => $approval->task->working_step_name,
                    'completion_status' => $approval->task->completion_status,
                    'status' => $latestAssignment->status ?? 'Draft',
                    'approval_role' => $approval->role,
                    'is_required' => $approval->task->is_required,
                    'updated_at' => $approval->task->updated_at,
                ];
            })
            ->sortByDesc('updated_at')
            ->take(10)
            ->values()
            : collect([]);

        // 5. Task Completion Trend (last 7 days)
        $taskTrend = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $count = $hasProjects
                ? \App\Models\TaskWorker::whereIn('project_team_id', $projectTeamIds)
                ->whereHas('task', function ($query) use ($date) {
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
            ? Project::whereHas('projectTeams', function ($query) use ($user) {
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
            ->with(['task.taskAssignments' => function ($query) {
                $query->orderBy('time', 'asc');
            }, 'task.workingStep.project'])
            ->get()
            ->filter(function ($taskWorker) {
                return $taskWorker->task &&
                    $taskWorker->task->taskAssignments->isNotEmpty() &&
                    $taskWorker->task->completion_status !== 'completed';
            })
            ->map(function ($taskWorker) {
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
            'myAssignedTasks' => $myAssignedTasks,
            'tasksPendingApproval' => $tasksPendingApproval,
            'taskTrend' => $taskTrend,
            'upcomingDeadlines' => $upcomingDeadlines,
            'latestNews' => $latestNews,
        ]);
    }

    /**
     * API endpoint to get tasks pending approval for real-time dashboard updates
     */
    public function getPendingApprovals()
    {
        $user = Auth::user();

        // Get user's roles in projects
        $myRoles = ProjectTeam::where('user_id', $user->id)
            ->pluck('role', 'project_id')
            ->toArray();

        $hasProjects = !empty($myRoles);

        $tasksPendingApproval = $hasProjects
            ? \App\Models\TaskApproval::whereIn('role', array_values($myRoles))
            ->with(['task' => function ($query) {
                $query->with(['workingStep', 'taskAssignments' => function ($q) {
                    $q->latest();
                }]);
            }])
            ->get()
            ->filter(function ($approval) use ($myRoles) {
                if (!$approval->task) return false;

                // Check if user has the required role in this project
                $projectId = $approval->task->project_id;
                $userRoleInProject = $myRoles[$projectId] ?? null;

                if ($userRoleInProject !== $approval->role) return false;

                // Check if task needs approval from this role
                $latestAssignment = $approval->task->taskAssignments->first();
                $currentStatus = $latestAssignment->status ?? 'Draft';

                // Task is pending approval if status matches either "pending" or "progress" status for this role
                return $currentStatus === $approval->status_name_pending
                    || $currentStatus === $approval->status_name_progress;
            })
            ->map(function ($approval) {
                $latestAssignment = $approval->task->taskAssignments->first();
                return [
                    'id' => $approval->task->id,
                    'approval_id' => $approval->id,
                    'name' => $approval->task->name,
                    'project_id' => $approval->task->project_id,
                    'project_name' => $approval->task->project_name,
                    'working_step_name' => $approval->task->working_step_name,
                    'completion_status' => $approval->task->completion_status,
                    'status' => $latestAssignment->status ?? 'Draft',
                    'approval_role' => $approval->role,
                    'is_required' => $approval->task->is_required,
                    'updated_at' => $approval->task->updated_at,
                ];
            })
            ->sortByDesc('updated_at')
            ->take(10)
            ->values()
            : collect([]);

        return response()->json([
            'tasksPendingApproval' => $tasksPendingApproval
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
        $query = Project::whereHas('projectTeams', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })
            ->with(['projectTeams' => function ($query) use ($user) {
                $query->where('user_id', $user->id);
            }]);

        // Apply status filter (no archive filtering - company sees all projects by status)
        $query->where('status', $status);

        // Apply search filter
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                    ->orWhere('client_name', 'like', '%' . $search . '%');
            });
        }

        $projects = $query->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($project) {
                return [
                    'id' => $project->id,
                    'name' => $project->name,
                    'client_name' => $project->client_name,
                    'status' => $project->status,
                    'my_role' => $project->projectTeams->first()->role ?? 'member',
                    'created_at' => $project->created_at->format('Y-m-d H:i:s'),
                ];
            });

        // Get status counts (no archive filtering for company)
        $statusCounts = [
            'in_progress' => Project::whereHas('projectTeams', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })->where('status', 'In Progress')->count(),
            'completed' => Project::whereHas('projectTeams', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })->where('status', 'Completed')->count(),
            'suspended' => Project::whereHas('projectTeams', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })->where('status', 'Suspended')->count(),
            'canceled' => Project::whereHas('projectTeams', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })->where('status', 'Canceled')->count(),
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
    public function showProject(Request $request, Project $project)
    {
        $user = Auth::user();

        // Check if user is member of this project
        $teamMember = ProjectTeam::where('project_id', $project->id)
            ->where('user_id', $user->id)
            ->first();

        if (!$teamMember) {
            abort(403, 'You are not a member of this project.');
        }

        // Company users cannot access Draft projects
        if ($project->status === 'Draft') {
            abort(403, 'This project is still in draft status and cannot be accessed.');
        }

        // Get working steps with tasks
        $workingSteps = WorkingStep::where('project_id', $project->id)
            ->with(['tasks' => function ($query) {
                $query->with([
                    'taskWorkers.projectTeam',
                    'taskApprovals',
                    'taskAssignments' => function ($q) {
                        $q->with(['documents', 'clientDocuments'])->orderBy('created_at', 'desc');
                    }
                ])->orderBy('order');
            }])
            ->orderBy('order')
            ->get()
            ->map(function ($step) use ($user, $teamMember) {
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
                    'tasks' => $step->tasks->map(function ($task) use ($user, $teamMember) {
                        // Check if this user is assigned to this task
                        // TaskWorker has project_team_id, so we need to check if any worker's project_team_id matches our teamMember->id
                        $myAssignment = $task->taskWorkers->first(function ($worker) use ($teamMember) {
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
                            'can_upload_files' => $task->can_upload_files,
                            'multiple_files' => $task->multiple_files,
                            'approval_type' => $task->approval_type,
                            'due_date' => $task->due_date ? $task->due_date->format('Y-m-d') : null,
                            'approval_roles' => $task->taskApprovals->pluck('role')->toArray(),
                            'is_assigned_to_me' => $myAssignment !== null,
                            'my_assignment_id' => $myAssignment ? $myAssignment->id : null,
                            'can_edit' => $canEdit,
                            // Task workers (team members assigned)
                            'task_workers' => $task->taskWorkers->map(function ($worker) {
                                return [
                                    'id' => $worker->id,
                                    'worker_name' => $worker->worker_name,
                                    'worker_email' => $worker->worker_email,
                                    'worker_role' => $worker->worker_role,
                                    'project_team_id' => $worker->project_team_id,
                                ];
                            })->values()->toArray(),
                            // Latest assignment info for display
                            'latest_assignment' => $latestAssignment ? [
                                'id' => $latestAssignment->id,
                                'time' => $latestAssignment->time,
                                'notes' => $latestAssignment->notes,
                                'comment' => $latestAssignment->comment,
                                'client_comment' => $latestAssignment->client_comment,
                                'status' => $latestAssignment->status,
                                'created_at' => $latestAssignment->created_at,
                                'documents' => $latestAssignment->documents->map(function ($doc) {
                                    return [
                                        'id' => $doc->id,
                                        'name' => $doc->name,
                                        'file' => $doc->file,
                                        'uploaded_at' => $doc->uploaded_at,
                                    ];
                                }),
                                'client_documents' => $latestAssignment->clientDocuments->map(function ($clientDoc) {
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
                            'assignments' => $task->taskAssignments->map(function ($assignment) {
                                return [
                                    'id' => $assignment->id,
                                    'time' => $assignment->time,
                                    'notes' => $assignment->notes,
                                    'comment' => $assignment->comment,
                                    'client_comment' => $assignment->client_comment,
                                    'status' => $assignment->status,
                                    'created_at' => $assignment->created_at,
                                    'documents' => $assignment->documents->map(function ($doc) {
                                        return [
                                            'id' => $doc->id,
                                            'name' => $doc->name,
                                            'file' => $doc->file,
                                            'uploaded_at' => $doc->uploaded_at,
                                        ];
                                    }),
                                    'client_documents' => $assignment->clientDocuments->map(function ($clientDoc) {
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
            ->map(function ($member) {
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
            'from_search' => $request->input('from_search'),
            'from_status' => $request->input('from_status'),
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
            ->whereHas('projectTeam', function ($query) use ($user) {
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
        // UNLESS editing existing assignment (which already has files) OR task doesn't allow file uploads
        $hasFiles = $request->hasFile('files');
        $hasClientDocs = $request->has('client_documents') && is_array($request->client_documents) && count($request->client_documents) > 0;
        $hasExistingData = $taskAssignment && ($taskAssignment->documents()->count() > 0 || $taskAssignment->clientDocuments()->count() > 0);

        // Only enforce file/client document requirement if task allows file uploads
        if ($task->can_upload_files && !$hasFiles && !$hasClientDocs && !$hasExistingData) {
            return back()->withErrors(['error' => 'Please upload at least one file or request at least one document from client.']);
        }

        if ($taskAssignment && $isEditable) {
            // UPDATE existing assignment (edit mode for Draft/Submitted) using safe method
            $taskAssignment->updateSafely([
                'notes' => $request->notes,
                'time' => now(),
            ], $taskAssignment->version);

            // Update existing document labels if provided (without uploading new files)
            if ($request->has('existing_document_labels') && is_array($request->existing_document_labels)) {
                foreach ($request->existing_document_labels as $docLabel) {
                    if (isset($docLabel['doc_id']) && isset($docLabel['label'])) {
                        $document = \App\Models\Document::find($docLabel['doc_id']);
                        if ($document && $document->task_assignment_id == $taskAssignment->id) {
                            $document->updateSafely([
                                'name' => $docLabel['label'],
                                'slug' => \Illuminate\Support\Str::slug($docLabel['label'] . '-' . time() . '-' . uniqid()),
                            ], $document->version);
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
                // 🔒 RACE CONDITION PROTECTION: Use updateSafely instead of direct save
                try {
                    $latestAssignment->updateSafely([
                        'status' => $firstApproval->status_name_pending
                    ]);
                } catch (\Exception $e) {
                    return back()->withErrors(['error' => 'Task was modified by another user. Please refresh and try again.']);
                }
                
                // Get users who have the approval role for this task
                $approverUserIds = $this->getApproverUserIds($task, $firstApproval->role);
                
                // Dispatch event to notify approvers AFTER saving
                if (!empty($approverUserIds)) {
                    
                    // Dispatch event to notify team leaders
                    event(new NewApprovalNotification(
                        $task, 
                        $approverUserIds, 
                        "Task '{$task->name}' in project '{$task->project->name}' requires {$firstApproval->role} approval"
                    ));
                    
                }
            } else {
                // No approval workflow - check if needs client interaction
                if ($hasClientDocs) {
                    // 🔒 RACE CONDITION PROTECTION: Use updateSafely
                    try {
                        $latestAssignment->updateSafely(['status' => 'Submitted to Client']);
                    } catch (\Exception $e) {
                        return back()->withErrors(['error' => 'Task was modified by another user. Please refresh and try again.']);
                    }
                    
                    // Trigger client notification
                    $this->triggerClientNotification($task, $task->project);
                } else {
                    // No approval, no client interaction - mark as completed
                    DB::transaction(function() use ($latestAssignment, $task) {
                        try {
                            $latestAssignment->updateSafely(['status' => 'Completed']);
                            $task->updateSafely([
                                'completed_at' => now(),
                                'completion_status' => 'completed'
                            ]);
                            $task->markAsCompleted(); // Use method to trigger unlock logic
                        } catch (\Exception $e) {
                            throw new \Exception('Task was modified by another user. Please refresh and try again.');
                        }
                    });
                }
            }
        } elseif ($currentStatus === 'Client Reply' || $currentStatus === 'Under Review by Team') {
            // If client replied, auto-submit to first approval
            $firstApproval = $task->taskApprovals()->orderBy('order', 'asc')->first();
            $newStatus = $firstApproval ? $firstApproval->status_name_pending : 'Completed';
            
            // 🔒 RACE CONDITION PROTECTION: Use updateSafely
            try {
                $latestAssignment->updateSafely(['status' => $newStatus]);
            } catch (\Exception $e) {
                return back()->withErrors(['error' => 'Task was modified by another user. Please refresh and try again.']);
            }
        } elseif (str_contains($currentStatus, 'Returned for Revision')) {
            // If resubmitting after rejection, go back to the approver who rejected it
            if (str_contains($currentStatus, 'Client')) {
                $newStatus = $task->approval_type === 'Once' ? 'Submitted to Client' : $lowestApproval->status_name_pending;
                $latestAssignment->updateSafely(['status' => $newStatus], $latestAssignment->version);
                
                // Trigger client notification if status is 'Submitted to Client'
                if ($newStatus === 'Submitted to Client') {
                    $this->triggerClientNotification($task, $task->project);
                }
            } else {
                // Worker is resubmitting after approval rejection - notify the role that rejected it
                $rejectedByRole = null;
                $newStatus = null;
                
                if (str_contains($currentStatus, 'Team Leader')) {
                    $rejectedByRole = 'team leader';
                    $approval = $task->taskApprovals()->where('role', 'team leader')->first();
                    $newStatus = $approval ? $approval->status_name_pending : 'Pending Team Leader';
                } elseif (str_contains($currentStatus, 'Manager')) {
                    $rejectedByRole = 'manager';
                    $approval = $task->taskApprovals()->where('role', 'manager')->first();
                    $newStatus = $approval ? $approval->status_name_pending : 'Pending Manager';
                } elseif (str_contains($currentStatus, 'Supervisor')) {
                    $rejectedByRole = 'supervisor';
                    $approval = $task->taskApprovals()->where('role', 'supervisor')->first();
                    $newStatus = $approval ? $approval->status_name_pending : 'Pending Supervisor';
                } elseif (str_contains($currentStatus, 'Partner')) {
                    $rejectedByRole = 'partner';
                    $approval = $task->taskApprovals()->where('role', 'partner')->first();
                    $newStatus = $approval ? $approval->status_name_pending : 'Pending Partner';
                }
                
                if ($newStatus) {
                    // 🔒 RACE CONDITION PROTECTION: Use updateSafely for resubmission
                    try {
                        $latestAssignment->updateSafely(['status' => $newStatus]);
                    } catch (\Exception $e) {
                        return back()->withErrors(['error' => 'Task was modified by another user. Please refresh and try again.']);
                    }
                    
                    // 🔔 TRIGGER APPROVAL NOTIFICATION TO THE ROLE THAT REJECTED IT
                    if ($rejectedByRole) {
                        $approverUserIds = $this->getApproverUserIds($task, $rejectedByRole);
                        
                        if (!empty($approverUserIds)) {
                            event(new NewApprovalNotification(
                                $task, 
                                $approverUserIds, 
                                "Task '{$task->name}' has been revised and resubmitted for {$rejectedByRole} review"
                            ));
                            
                            Log::info('🔔 Resubmission notification sent to rejecting role', [
                                'task_id' => $task->id,
                                'rejected_by_role' => $rejectedByRole,
                                'approver_user_ids' => $approverUserIds,
                                'new_status' => $newStatus
                            ]);
                        }
                    }
                }
            }
        }

        // 🔒 RACE CONDITION PROTECTION: Update completion_status safely
        if ($task->completion_status === 'pending') {
            try {
                $task->updateSafely(['completion_status' => 'in_progress']);
            } catch (\Exception $e) {
                // If task update fails, log but don't fail the whole operation
                Log::warning('Failed to update task completion status due to concurrent modification', [
                    'task_id' => $task->id,
                    'error' => $e->getMessage()
                ]);
            }
        }

        return back()->with('success', 'Task submitted successfully!');
    }

    /**
     * Get user IDs of team members who have the specified role for approval
     */
    private function getApproverUserIds($task, $role)
    {
        // Get project teams with the specified role
        return \App\Models\ProjectTeam::where('project_id', $task->project_id)
            ->where('role', $role)
            ->pluck('user_id')
            ->toArray();
    }

    /**
     * Add comment to task
     */
    public function addTaskComment(Request $request, Task $task)
    {
        try {
            $result = SafeTransactionService::executeWithRetry(function () use ($request, $task) {
                $user = Auth::user();

                // Check if user is assigned to this task
                $taskWorker = \App\Models\TaskWorker::where('task_id', $task->id)
                    ->whereHas('projectTeam', function ($query) use ($user) {
                        $query->where('user_id', $user->id);
                    })
                    ->first();

                if (!$taskWorker) {
                    throw new \Exception('You are not assigned to this task.');
                }

                $request->validate([
                    'comment' => 'required|string',
                ]);

                // Update task comment safely
                $task->updateSafely([
                    'comment' => $request->comment
                ], $task->version);

                return [
                    'success' => true,
                    'message' => 'Comment added successfully!'
                ];
            });

            return back()->with('success', $result['message']);

        } catch (\Exception $e) {
            Log::error('Add task comment failed', [
                'task_id' => $task->id,
                'user_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);
            return back()->withErrors(['error' => $e->getMessage()]);
        }
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
        $tasks = Task::whereHas('workingStep', function ($query) use ($project) {
            $query->where('project_id', $project->id);
        })
            ->whereHas('taskApprovals', function ($query) use ($role) {
                // Task must have approval workflow for this role
                $query->where('role', $role);
            })
            ->get()
            ->filter(function ($task) use ($role) {
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
                'taskAssignments' => function ($q) {
                    $q->with(['documents', 'clientDocuments'])
                        ->orderBy('created_at', 'desc')
                        ->limit(1); // Only get latest assignment
                }
            ])
            ->sortByDesc('created_at')
            ->values()
            ->map(function ($task) {
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
                        'documents' => $latestAssignment->documents->map(function ($doc) {
                            return [
                                'id' => $doc->id,
                                'name' => $doc->name,
                                'file' => $doc->file,
                            ];
                        }),
                        'client_documents' => $latestAssignment->clientDocuments->map(function ($clientDoc) {
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

        if (!$latestAssignment || ($latestAssignment->status !== $approval->status_name_pending && $latestAssignment->status !== $approval->status_name_progress)) {
            // Check if this role has already approved (status is approved or completed for this role)
            $hasApproved = $latestAssignment && (
                $latestAssignment->status === $approval->status_name_complete ||
                str_contains(strtolower($latestAssignment->status), 'approved by ' . $role)
            );
            
            if ($hasApproved) {
                // User has already approved, redirect with info message
                return redirect()
                    ->route('company.projects.show', $task->workingStep->project_id)
                    ->with('info', 'You have already approved this task. It is now awaiting approval from other team members.');
            }
            
            // Otherwise, it's truly not their turn
            return redirect()
                ->route('company.projects.show', $task->workingStep->project_id)
                ->with('error', 'This task is not currently waiting for your approval.');
        }

        // dd($latestAssignment->status, $approval->status_name_pending, $latestAssignment->maker_can_edit);
        // Update status from pending to in-progress when detail page is opened (only if still pending)
        // Also disable maker_can_edit in the same update to avoid version conflicts
        $updates = [];
        
        if ($latestAssignment->status === $approval->status_name_pending) {
            $updates['status'] = $approval->status_name_progress;
        }
        
        if ($latestAssignment->maker_can_edit === 1) {
            $updates['maker_can_edit'] = false;
        }
        
        // Perform single update if there are any changes
        if (!empty($updates)) {
            $latestAssignment->updateSafely($updates, $latestAssignment->version);
            // Refresh the model to get the updated version
            $latestAssignment->refresh();
        }

        // Load task with relationships
        $task->load([
            'workingStep',
            'taskAssignments' => function ($q) {
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
                'documents' => $latestAssignment->documents->map(function ($doc) {
                    return [
                        'id' => $doc->id,
                        'name' => $doc->name,
                        'file' => $doc->file,
                    ];
                }),
                'client_documents' => $latestAssignment->clientDocuments->map(function ($clientDoc) {
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
            'status' => $task->project->status ?? 'In Progress',
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

        // 📖 MARK RELATED APPROVAL NOTIFICATIONS AS READ
        \App\Models\Notification::where('user_id', $user->id)
            ->whereNull('read_at')
            ->where(function($query) use ($task) {
                // Mark notifications related to this specific task as read
                $query->whereRaw('JSON_EXTRACT(data, "$.task_id") = ?', [$task->id])
                      ->orWhere('url', 'like', '%/tasks/' . $task->id . '%')
                      ->orWhere('url', 'like', '%/company/tasks/' . $task->id . '%');
            })
            ->update(['read_at' => now()]);

        Log::info('📖 Company task notifications marked as read', [
            'user_id' => $user->id,
            'task_id' => $task->id,
            'task_name' => $task->name,
            'user_role' => $teamMember->role
        ]);

        // Get latest assignment
        $latestAssignment = $task->taskAssignments()->orderBy('created_at', 'desc')->first();
        
        // Check if task can be edited
        $canEdit = false;
        $lowestApproval = $task->taskApprovals()->orderBy('order', 'asc')->first();
        
        if ($lowestApproval && $latestAssignment) {
            $previousAssignment = $task->taskAssignments()->orderBy('created_at', 'desc')->skip(1)->first();
            if (!$previousAssignment) {
                $currentApprovalRole = $lowestApproval;
            } else {
                $currentApprovalRole = $task->taskApprovals()->where('role', str_contains($previousAssignment->status, 'Team Leader') ? 'team leader' :
                    (str_contains($previousAssignment->status, 'Manager') ? 'manager' :
                    (str_contains($previousAssignment->status, 'Supervisor') ? 'supervisor' :
                    (str_contains($previousAssignment->status, 'Partner') ? 'partner' : ''))))->first();
            }
            if ($latestAssignment->maker === 'client' && $latestAssignment->maker_can_edit === 1 && $latestAssignment->status === 'Client Reply') {
                // $latestAssignment->status = 'Under Review by Team';
                $latestAssignment->updateSafely(['maker_can_edit' => false], $latestAssignment->version);
            }
            // Can edit if at lowest approval pending
            if (!$currentApprovalRole) {
                $canEdit = $latestAssignment->maker === 'company' && $latestAssignment->maker_can_edit === 1;
            } else {
                $canEdit = $latestAssignment->maker === 'company' && $latestAssignment->status === $currentApprovalRole->status_name_pending && $latestAssignment->maker_can_edit === 1;
            }

            // Or if rejected at any level
            // if (!$canEdit) {
            //     $isRejected = $task->taskApprovals()
            //         ->where('status_name_reject', $latestAssignment->status)
            //         ->exists();

            //     // Fallback for hardcoded statuses
            //     if (!$isRejected) {
            //         $isRejected = str_contains($latestAssignment->status, 'Returned for Revision') ||
            //             str_contains($latestAssignment->status, 'Rejected');
            //     }

            //     $canEdit = $isRejected;
            // }
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
            'can_upload_files' => $task->can_upload_files,
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
                'documents' => $latestAssignment->documents->map(function ($doc) {
                    return [
                        'id' => $doc->id,
                        'name' => $doc->name,
                        'file' => $doc->file,
                        'uploaded_at' => $doc->created_at,
                    ];
                }),
                'client_documents' => $latestAssignment->clientDocuments->map(function ($doc) {
                    return [
                        'id' => $doc->id,
                        'name' => $doc->name,
                        'description' => $doc->description,
                        'file' => $doc->file,
                        'uploaded_at' => $doc->updated_at,
                    ];
                }),
            ] : null,
            'assignments' => $task->taskAssignments()->orderBy('created_at', 'desc')->get()->map(function ($assignment) {
                return [
                    'id' => $assignment->id,
                    'time' => $assignment->time,
                    'notes' => $assignment->notes,
                    'comment' => $assignment->comment,
                    'client_comment' => $assignment->client_comment,
                    'status' => $assignment->status,
                    'created_at' => $assignment->created_at,
                    'documents' => $assignment->documents->map(function ($doc) {
                        return [
                            'id' => $doc->id,
                            'name' => $doc->name,
                            'file' => $doc->file,
                            'uploaded_at' => $doc->created_at,
                        ];
                    }),
                    'client_documents' => $assignment->clientDocuments->map(function ($doc) {
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
            'task_workers' => $task->taskWorkers->map(function ($worker) {
                return [
                    'id' => $worker->id,
                    'worker_name' => $worker->worker_name,
                    'worker_email' => $worker->worker_email,
                    'worker_role' => $worker->worker_role,
                ];
            }),
        ];

        // Build project data
        $projectData = [
            'id' => $task->workingStep->project->id,
            'name' => $task->workingStep->project->name,
            'slug' => $task->workingStep->project->slug,
            'status' => $task->workingStep->project->status,
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
        try {
            $result = SafeTransactionService::executeWithRetry(function () use ($request, $task) {
                $user = Auth::user();

                // Get team member to verify role
                $teamMember = ProjectTeam::where('project_id', $task->workingStep->project_id)
                    ->where('user_id', $user->id)
                    ->first();

                if (!$teamMember) {
                    throw new \Exception('You are not a member of this project.');
                }

                $role = strtolower($teamMember->role);

                // Get latest assignment with row-level locking for concurrent approval protection
                $latestAssignment = $task->taskAssignments()
                    ->orderBy('created_at', 'desc')
                    ->lockForUpdate()
                    ->first();

                if (!$latestAssignment) {
                    throw new \Exception('No assignment found for this task.');
                }

                // Get current approval from task_approvals based on current role
                $currentApproval = $task->taskApprovals()
                    ->where('role', $role)
                    ->first();

                if (!$currentApproval) {
                    throw new \Exception('You are not part of the approval workflow for this task.');
                }

                // Verify current status matches the pending OR progress status for this approval
                if (
                    $latestAssignment->status !== $currentApproval->status_name_pending &&
                    $latestAssignment->status !== $currentApproval->status_name_progress
                ) {
                    throw new \Exception('You cannot approve this task in its current status.');
                }

                // Check if this user has already approved this assignment
                $existingApprovalLog = \App\Models\ActivityLog::where('target_type', 'App\Models\Task')
                    ->where('target_id', $task->id)
                    ->where('action_type', 'Task Approved')
                    ->where('user_id', $user->id)
                    ->whereRaw('JSON_EXTRACT(meta, "$.task_assignment_id") = ?', [$latestAssignment->id])
                    ->whereRaw('JSON_EXTRACT(meta, "$.approval_role") = ?', [strtolower($role)])
                    ->first();

                if ($existingApprovalLog) {
                    throw new \Exception('You have already approved this assignment.');
                }

                // Get next approval in workflow (higher order)
                $nextApproval = $task->taskApprovals()
                    ->where('order', '>', $currentApproval->order)
                    ->orderBy('order', 'asc')
                    ->first();

                // Update assignment using optimistic locking
                $updateData = [];
                $message = "";

                if ($nextApproval) {
                    // Auto-advance to next approval level
                    $updateData['status'] = $nextApproval->status_name_pending;
                    $message = "Task approved and forwarded to next reviewer!";
                } else {
                    // Final approval - check if task needs client interaction
                    $hasClientInteraction = ($task->client_interact !== 'read only' && $task->client_interact !== 'restricted');

                    if ($hasClientInteraction) {
                        // Has client documents to upload - send to client
                        $updateData['status'] = 'Submitted to Client';
                        $message = "Task approved! Waiting for client to upload requested documents.";
                        
                        // Set flag to trigger client notification after update
                        $needsClientNotification = true;
                        $clientNotificationType = 'action_required';
                    } else {
                        // No client interaction needed - mark as completed
                        $updateData['status'] = 'Submitted to Client';
                        $message = "Task approved and marked as completed!";
                        
                        // Set flag to trigger client notification after update
                        $needsClientNotification = true;
                        $clientNotificationType = 'task_completed';

                        // Update task completion
                        $task->updateSafely([
                            'completed_at' => now(),
                            'completion_status' => 'completed'
                        ], $task->version);

                        $task->markAsCompleted(); // Use method to trigger unlock logic
                    }
                }

                // dd($message, $hasClientInteraction, $task->client_interact);

                // Update assignment safely
                $latestAssignment->updateSafely($updateData, $latestAssignment->version);
                
                // Note: Client notification is now handled in the final approval section below

                // Log approval action
                \App\Models\ActivityLog::create([
                    'user_id' => $user->id,
                    'user_name' => $user->name,
                    'user_email' => $user->email,
                    'user_role' => $role,
                    'action_type' => 'Task Approved',
                    'action' => 'approved',
                    'target_type' => 'App\Models\Task',
                    'target_id' => $task->id,
                    'target_name' => $task->name,
                    'description' => "Task approved by {$role}: {$user->name}",
                    'meta' => [
                        'task_assignment_id' => $latestAssignment->id,
                        'approval_role' => $role,
                        'previous_status' => $latestAssignment->getOriginal('status'),
                        'new_status' => $latestAssignment->status,
                        'task_id' => $task->id,
                        'project_id' => $task->workingStep->project_id
                    ],
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->header('User-Agent')
                ]);

                // Trigger worker notification about approval
                if ($nextApproval) {
                    // Task forwarded to next approval level
                    $this->triggerWorkerNotification(
                        $task, 
                        $task->project, 
                        'company_approved', 
                        "Your task '{$task->name}' has been approved by {$role} and forwarded to the next level"
                    );
                    
                    // Trigger approval notification to next role
                    $this->triggerApprovalNotificationForNextRole(
                        $task, 
                        $nextApproval->role,
                        "Task '{$task->name}' needs your approval (forwarded from {$role})"
                    );
                } else if (isset($needsClientNotification) && $needsClientNotification) {
                    // Final approval - task completed or sent to client
                    $actionType = ($task->completion_status === 'completed') ? 'task_completed' : 'company_approved';
                    $workerMessage = ($task->completion_status === 'completed') 
                        ? "Your task '{$task->name}' has been fully approved and completed" 
                        : "Your task '{$task->name}' has been approved and sent to client";
                    
                    $clientMessage = ($task->completion_status === 'completed') 
                        ? "Task '{$task->name}' in your project has been completed successfully!" 
                        : "Task '{$task->name}' in your project has been approved and submitted to you";
                        
                    // Notify worker about the approval
                    $this->triggerWorkerNotification(
                        $task, 
                        $task->project, 
                        $actionType, 
                        $workerMessage
                    );
                    
                    // Notify client about the task status
                    $this->triggerClientNotification(
                        $task, 
                        $task->project, 
                        $clientMessage
                    );
                }

                return [
                    'success' => true,
                    'message' => $message,
                    'project_id' => $task->workingStep->project_id
                ];
            });

            // Redirect to project page after successful approve
            $projectId = $result['project_id'];
            return redirect()->route('company.projects.show', $projectId)
                ->with('success', $result['message']);

        } catch (\Exception $e) {
            Log::error('Approval failed', [
                'task_id' => $task->id,
                'user_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);

            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    /**
     * Reject a task and send back for revision
     */
    public function rejectTask(Request $request, Task $task)
    {
        try {
            $result = SafeTransactionService::executeWithRetry(function () use ($request, $task) {
                $user = Auth::user();

                // Get team member to verify role
                $teamMember = ProjectTeam::where('project_id', $task->workingStep->project_id)
                    ->where('user_id', $user->id)
                    ->first();

                if (!$teamMember) {
                    throw new \Exception('You are not a member of this project.');
                }

                $role = strtolower($teamMember->role);

                // Get latest assignment with row-level locking
                $latestAssignment = $task->taskAssignments()
                    ->orderBy('created_at', 'desc')
                    ->lockForUpdate()
                    ->first();

                if (!$latestAssignment) {
                    throw new \Exception('No assignment found for this task.');
                }

                // Get current approval from task_approvals based on current role
                $currentApproval = $task->taskApprovals()
                    ->where('role', $role)
                    ->first();

                if (!$currentApproval) {
                    throw new \Exception('You are not part of the approval workflow for this task.');
                }

                // Verify current status matches the pending OR progress status for this approval
                if (
                    $latestAssignment->status !== $currentApproval->status_name_pending &&
                    $latestAssignment->status !== $currentApproval->status_name_progress
                ) {
                    throw new \Exception('You cannot reject this task in its current status.');
                }

                $request->validate([
                    'comment' => 'required|string',
                ]);

                // Check if this user has already rejected this assignment
                $existingRejectionLog = \App\Models\ActivityLog::where('target_type', 'App\Models\Task')
                    ->where('target_id', $task->id)
                    ->where('action_type', 'Task Rejected')
                    ->where('user_id', $user->id)
                    ->whereRaw('JSON_EXTRACT(meta, "$.task_assignment_id") = ?', [$latestAssignment->id])
                    ->whereRaw('JSON_EXTRACT(meta, "$.approval_role") = ?', [strtolower($role)])
                    ->first();

                if ($existingRejectionLog) {
                    throw new \Exception('You have already rejected this assignment.');
                }

                // Update assignment status to rejected using optimistic locking
                $latestAssignment->updateSafely([
                    'status' => $currentApproval->status_name_reject,
                    'comment' => $request->comment
                ], $latestAssignment->version);

                // Log rejection action
                \App\Models\ActivityLog::create([
                    'user_id' => $user->id,
                    'user_name' => $user->name,
                    'user_email' => $user->email,
                    'user_role' => $role,
                    'action_type' => 'Task Rejected',
                    'action' => 'rejected',
                    'target_type' => 'App\Models\Task',
                    'target_id' => $task->id,
                    'target_name' => $task->name,
                    'description' => "Task rejected by {$role}: {$user->name} - {$request->comment}",
                    'meta' => [
                        'task_assignment_id' => $latestAssignment->id,
                        'approval_role' => $role,
                        'previous_status' => $latestAssignment->getOriginal('status'),
                        'new_status' => $latestAssignment->status,
                        'rejection_comment' => $request->comment,
                        'task_id' => $task->id,
                        'project_id' => $task->workingStep->project_id
                    ],
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->header('User-Agent')
                ]);

                // Trigger worker notification about rejection
                $this->triggerWorkerNotification(
                    $task, 
                    $task->project, 
                    'company_rejected', 
                    "Your task '{$task->name}' has been rejected by {$role} and needs revision. Reason: {$request->comment}"
                );

                return [
                    'success' => true,
                    'message' => 'Task rejected and returned for revision.',
                    'project_id' => $task->workingStep->project_id
                ];
            });

            // Redirect to project page after successful reject
            $projectId = $result['project_id'];
            return redirect()->route('company.projects.show', $projectId)
                ->with('success', $result['message']);

        } catch (\Exception $e) {
            Log::error('Rejection failed', [
                'task_id' => $task->id,
                'user_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    /**
     * Accept client documents and mark task as ready for review
     */
    public function acceptClientDocuments(Request $request, Task $task)
    {
        try {
            $result = SafeTransactionService::executeWithRetry(function () use ($request, $task) {
                $user = Auth::user();

                // Check if user is assigned to this task
                $taskWorker = \App\Models\TaskWorker::where('task_id', $task->id)
                    ->whereHas('projectTeam', function ($query) use ($user) {
                        $query->where('user_id', $user->id);
                    })
                    ->first();

                if (!$taskWorker) {
                    throw new \Exception('You are not assigned to this task.');
                }

                // Get latest assignment with row-level locking
                $latestAssignment = $task->taskAssignments()
                    ->latest()
                    ->lockForUpdate()
                    ->first();

                if (!$latestAssignment) {
                    throw new \Exception('No assignment found for this task.');
                }

                // Verify task assignment status is "Client Reply"
                if ($latestAssignment->status !== 'Client Reply') {
                    throw new \Exception('Task is not in Client Reply status.');
                }

                // Verify all client documents have been uploaded
                $clientDocuments = $latestAssignment->clientDocuments;
                $allUploaded = $clientDocuments->every(function ($doc) {
                    return $doc->file !== null;
                });

                if (!$allUploaded) {
                    throw new \Exception('Not all client documents have been uploaded yet.');
                }

                // Check for duplicate acceptance
                $existingAcceptanceLog = \App\Models\ActivityLog::where('target_type', 'App\Models\Task')
                    ->where('target_id', $task->id)
                    ->where('action_type', 'task_status')
                    ->where('action', 'accepted_client_documents')
                    ->where('user_id', $user->id)
                    ->whereRaw('JSON_EXTRACT(meta, "$.task_assignment_id") = ?', [$latestAssignment->id])
                    ->first();

                if ($existingAcceptanceLog) {
                    throw new \Exception('Client documents have already been accepted for this assignment.');
                }

                // Update assignment status using optimistic locking
                $latestAssignment->updateSafely([
                    'status' => 'Completed'
                ], $latestAssignment->version);

                // Mark task as completed using optimistic locking
                $task->updateSafely([
                    'completed_at' => now(),
                    'completion_status' => 'completed'
                ], $task->version);

                $task->markAsCompleted(); // Use method to trigger unlock logic

                // Log activity
                \App\Models\ActivityLog::create([
                    'user_id' => Auth::id(),
                    'user_name' => Auth::user()->name,
                    'action_type' => 'task_status',
                    'action' => 'accepted_client_documents',
                    'target_type' => 'App\Models\Task',
                    'target_id' => $task->id,
                    'target_name' => $task->name,
                    'description' => 'Client documents accepted and task marked as completed',
                    'meta' => [
                        'task_assignment_id' => $latestAssignment->id,
                        'previous_status' => $latestAssignment->getOriginal('status'),
                        'new_status' => $latestAssignment->status,
                        'task_id' => $task->id,
                        'project_id' => $task->workingStep->project_id
                    ],
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->header('User-Agent')
                ]);

                return [
                    'success' => true,
                    'message' => 'Client documents accepted and task marked as completed.',
                    'project_id' => $task->workingStep->project_id
                ];
            });

            // Redirect to project page
            $projectId = $result['project_id'];
            return redirect()->route('company.projects.show', $projectId)
                ->with('success', $result['message']);

        } catch (\Exception $e) {
            Log::error('Accept client documents failed', [
                'task_id' => $task->id,
                'user_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    /**
     * Request client to re-upload documents (creates new assignment)
     */
    public function requestReupload(Request $request, Task $task)
    {
        try {
            $result = SafeTransactionService::executeWithRetry(function () use ($request, $task) {
                $user = Auth::user();

                // Check if user is assigned to this task
                $taskWorker = \App\Models\TaskWorker::where('task_id', $task->id)
                    ->whereHas('projectTeam', function ($query) use ($user) {
                        $query->where('user_id', $user->id);
                    })
                    ->first();

                if (!$taskWorker) {
                    throw new \Exception('You are not assigned to this task.');
                }

                // Get latest assignment with row-level locking
                $latestAssignment = $task->taskAssignments()
                    ->latest()
                    ->lockForUpdate()
                    ->first();

                if (!$latestAssignment) {
                    throw new \Exception('No assignment found for this task.');
                }

                // Verify task assignment status is "Client Reply"
                if ($latestAssignment->status !== 'Client Reply') {
                    throw new \Exception('Task is not in Client Reply status.');
                }

                $request->validate([
                    'comment' => 'required|string|max:1000',
                ]);

                $lowestApproval = $task->taskApprovals()->orderBy('order', 'asc')->first();

                // Create NEW task assignment (old one remains for history) using safe method
                $newStatus = $task->approval_type == 'Once' ? 'Submitted to Client' : $lowestApproval->status_name_pending;
                $newAssignment = (new \App\Models\TaskAssignment)->createSafely([
                    'task_id' => $task->id,
                    'user_id' => $user->id,
                    'task_name' => $task->name,
                    'working_step_name' => $task->working_step_name,
                    'project_name' => $task->project_name,
                    'project_client_name' => $task->project_client_name,
                    'time' => now(),
                    'notes' => "Re-upload requested\nComment:\n" . $request->comment,
                    // 'maker' => $task->approval_type == 'Once' ? 'client' : 'company',
                    'maker' => 'company',
                    'maker_can_edit' => true,
                    'status' => $newStatus, // Set status to request re-upload from client
                ]);

                // Copy team documents to new assignment (WITH files - keep team's uploaded documents)
                $oldDocuments = $latestAssignment->documents;
                foreach ($oldDocuments as $oldDoc) {
                    (new \App\Models\Document)->createSafely([
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
                    (new \App\Models\ClientDocument)->createSafely([
                        'task_assignment_id' => $newAssignment->id,
                        'name' => $oldDoc->name,
                        'slug' => \Illuminate\Support\Str::slug($oldDoc->name . '-' . time() . '-' . uniqid()),
                        'description' => $oldDoc->description,
                        'file' => null, // No file - client needs to upload again
                        'uploaded_at' => null,
                    ]);
                }

                // Log activity
                \App\Models\ActivityLog::create([
                    'user_id' => Auth::id(),
                    'user_name' => Auth::user()->name,
                    'action_type' => 'task_status',
                    'action' => 'requested_reupload',
                    'target_name' => $task->name,
                    'description' => "Requested client to re-upload documents for task: {$task->name}",
                    'meta' => [
                        'task_id' => $task->id,
                        'comment' => $request->comment,
                        'previous_assignment_id' => $latestAssignment->id,
                        'new_assignment_id' => $newAssignment->id,
                    ],
                ]);
                
                // Trigger client notification if status is 'Submitted to Client'
                if ($newStatus === 'Submitted to Client') {
                    $this->triggerClientNotification($task, $task->project);
                }

                return [
                    'success' => true,
                    'message' => 'Re-upload request sent to client. Previous submission kept in history.',
                ];
            });

            return back()->with('success', $result['message']);

        } catch (\Exception $e) {
            Log::error('Request reupload failed', [
                'task_id' => $task->id,
                'user_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);
            return back()->with('error', $e->getMessage());
        }
    }

    // ==================== TASK ASSIGNMENT MANAGEMENT ====================
    
    /**
     * Get assignment data for a specific task
     */
    private function getTaskAssignmentData(Task $task)
    {
        // Get assigned workers
        $assignedWorkers = TaskWorker::where('task_id', $task->id)
            ->with('projectTeam.user')
            ->get()
            ->map(function ($taskWorker) {
                return [
                    'id' => $taskWorker->id,
                    'worker_name' => $taskWorker->worker_name,
                    'worker_email' => $taskWorker->worker_email,
                    'worker_role' => $taskWorker->worker_role,
                ];
            });

        // Get available team members (not assigned to this task)
        $assignedTeamIds = TaskWorker::where('task_id', $task->id)
            ->pluck('project_team_id')
            ->toArray();

        $availableMembers = ProjectTeam::where('project_id', $task->project_id)
            ->whereNotIn('id', $assignedTeamIds)
            ->with('user')
            ->get()
            ->map(function ($member) {
                return [
                    'id' => $member->id,
                    'user_name' => $member->user_name,
                    'user_email' => $member->user_email,
                    'user_position' => $member->user_position,
                    'role' => $member->role,
                ];
            });

        return [
            'assigned_workers' => $assignedWorkers,
            'available_members' => $availableMembers,
        ];
    }

    /**
     * Assign a team member to a specific task
     * Only team leaders and above can perform this action
     */
    public function assignMemberToTask(Request $request, Task $task)
    {
        try {
            $result = SafeTransactionService::executeWithRetry(function () use ($request, $task) {
                $request->validate([
                    'project_team_id' => 'required|exists:project_teams,id',
                ]);

                $user = $request->user();
                
                // Get the team member to be assigned with locking
                $teamMember = ProjectTeam::lockForUpdate()->findOrFail($request->project_team_id);
                
                // Validate that the team member belongs to the same project
                if ($teamMember->project_id !== $task->project_id) {
                    throw new \Exception('Team member does not belong to this project');
                }

                // Check if team member is already assigned to this task
                $existingAssignment = TaskWorker::where('task_id', $task->id)
                    ->where('project_team_id', $teamMember->id)
                    ->lockForUpdate()
                    ->first();

                if ($existingAssignment) {
                    throw new \Exception('Team member is already assigned to this task');
                }

                // Create the task assignment safely
                $taskWorker = TaskWorker::createSafely([
                    'task_id' => $task->id,
                    'project_team_id' => $teamMember->id,
                    'task_name' => $task->name,
                    'working_step_name' => $task->workingStep->name,
                    'project_name' => $task->project->name,
                    'project_client_name' => $task->project->client_name,
                    'worker_name' => $teamMember->user_name,
                    'worker_email' => $teamMember->user_email,
                    'worker_role' => $teamMember->role,
                ]);

                // Get updated assignment data
                $assignmentData = $this->getTaskAssignmentData($task);

                return [
                    'success' => true,
                    'message' => "Successfully assigned {$teamMember->user_name} to task: {$task->name}",
                    'assigned_workers' => $assignmentData['assigned_workers'],
                    'available_members' => $assignmentData['available_members'],
                ];
            });

            return response()->json($result);

        } catch (\Exception $e) {
            Log::error('Task assignment failed', [
                'task_id' => $task->id,
                'project_team_id' => $request->project_team_id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 422);
        }
    }

    /**
     * Unassign a team member from a specific task
     * Only team leaders and above can perform this action
     */
    public function unassignMemberFromTask(Request $request, Task $task, TaskWorker $taskWorker)
    {
        try {
            $result = SafeTransactionService::executeWithRetry(function () use ($request, $task, $taskWorker) {
                // Validate that the task worker belongs to this task
                if ($taskWorker->task_id !== $task->id) {
                    throw new \Exception('Task assignment does not belong to this task');
                }

                $workerName = $taskWorker->worker_name;
                
                // Delete safely with optimistic locking
                $taskWorker->deleteSafely($taskWorker->version);

                // Get updated assignment data
                $assignmentData = $this->getTaskAssignmentData($task);

                return [
                    'success' => true,
                    'message' => "Successfully unassigned {$workerName} from task: {$task->name}",
                    'assigned_workers' => $assignmentData['assigned_workers'],
                    'available_members' => $assignmentData['available_members'],
                ];
            });

            return response()->json($result);

        } catch (\Exception $e) {
            Log::error('Task unassignment failed', [
                'task_id' => $task->id,
                'task_worker_id' => $taskWorker->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 422);
        }
    }

    /**
     * Update task settings (Team Leader and above only)
     */
    public function updateTaskSettings(Request $request, Project $project, Task $task)
    {
        $user = Auth::user();

        // Check if user is team leader or above
        $teamMember = ProjectTeam::where('project_id', $project->id)
            ->where('user_id', $user->id)
            ->first();

        if (!$teamMember || !in_array($teamMember->role, ['team leader', 'supervisor', 'manager', 'partner'])) {
            return back()->withErrors(['error' => 'You do not have permission to manage task settings.']);
        }

        // Validate request data
        $request->validate([
            'client_interact' => 'required|in:read only,restricted,upload,approval',
            'can_upload_files' => 'required|boolean',
            'multiple_files' => 'required|boolean',
            'is_required' => 'required|boolean',
            'due_date' => 'nullable|date|after_or_equal:today',
            'worker_ids' => 'nullable|array',
            'worker_ids.*' => 'exists:project_teams,id',
            'approval_roles' => 'nullable|array',
            'approval_roles.*' => 'in:team leader,supervisor,manager,partner',
            'approval_type' => 'required|in:Once,All Attempts',
        ]);

        // Update task settings safely
        $task->updateSafely([
            'client_interact' => $request->client_interact,
            'can_upload_files' => $request->can_upload_files,
            'multiple_files' => $request->multiple_files,
            'is_required' => $request->is_required,
            'due_date' => $request->due_date,
            'approval_type' => $request->approval_type,
        ], $task->version);

        // Update task worker assignments
        if ($request->has('worker_ids')) {
            // Remove existing task workers
            \App\Models\TaskWorker::where('task_id', $task->id)->delete();

            // Add new task workers
            foreach ($request->worker_ids as $projectTeamId) {
                $projectTeam = ProjectTeam::find($projectTeamId);
                if ($projectTeam) {
                    \App\Models\TaskWorker::create([
                        'task_id' => $task->id,
                        'project_team_id' => $projectTeamId,
                        'task_name' => $task->name,
                        'working_step_name' => $task->workingStep->name,
                        'project_name' => $task->workingStep->project->name,
                        'project_client_name' => $task->workingStep->project->client->name,
                        'worker_name' => $projectTeam->user->name,
                        'worker_email' => $projectTeam->user->email,
                        'worker_role' => $projectTeam->role,
                    ]);
                }
            }
        }

        // Update task approvals
        if ($request->has('approval_roles')) {
            // Remove existing task approvals
            \App\Models\TaskApproval::where('task_id', $task->id)->delete();

            // Add new task approvals with proper ordering
            $rolePriority = [
                'team leader' => 1,
                'supervisor' => 2,
                'manager' => 3,
                'partner' => 4,
            ];

            $sortedRoles = collect($request->approval_roles)
                ->sort(fn($a, $b) => $rolePriority[$a] - $rolePriority[$b])
                ->values();

            foreach ($sortedRoles as $index => $role) {
                \App\Models\TaskApproval::create([
                    'task_id' => $task->id,
                    'task_name' => $task->name,
                    'working_step_name' => $task->workingStep->name,
                    'project_name' => $task->workingStep->project->name,
                    'project_client_name' => $task->workingStep->project->client->name,
                    'role' => $role,
                    'order' => $index + 1,
                    'status_name_pending' => "Under Review by " . ucwords($role),
                    'status_name_progress' => "In Progress by " . ucwords($role),
                    'status_name_approved' => "Approved by " . ucwords($role),
                    'status_name_reject' => "Returned for Revision by " . ucwords($role),
                    'status_name_complete' => "Completed by " . ucwords($role),
                ]);
            }
        }

        return back()->with('success', 'Task settings updated successfully!');
    }
    
    /**
     * Helper function to trigger client notification when task is submitted to client
     */
    private function triggerClientNotification($task, $project, $customMessage = null)
    {
        // Get client user IDs for this project
        $clientUserIds = [];
        
        // Method 1: If project has client_id, find users with that client_id
        if ($project->client_id) {
            $clientUsers = User::where('role', 'client')
                ->where('client_id', $project->client_id)
                ->pluck('id')
                ->toArray();
                
            $clientUserIds = array_merge($clientUserIds, $clientUsers);
        }
        
        // Method 2: Try to find client users through project teams as fallback
        if (empty($clientUserIds)) {
            $projectTeamClientIds = $project->users()
                ->where('users.role', 'client')
                ->pluck('users.id')
                ->toArray();
                
            $clientUserIds = array_merge($clientUserIds, $projectTeamClientIds);
        }
        
        // Remove duplicates
        $clientUserIds = array_unique($clientUserIds);
            
        if (!empty($clientUserIds)) {
            // Use custom message if provided, otherwise use default
            $message = $customMessage ?? "New task '{$task->name}' has been submitted for your review in project '{$project->name}'";
            
            // Dispatch event to notify client
            event(new NewClientTaskNotification(
                $task, 
                $project,
                $clientUserIds, 
                $message
            ));
            
            Log::info('🔔 Client notification triggered', [
                'task_id' => $task->id,
                'project_id' => $project->id,
                'client_count' => count($clientUserIds),
                'client_user_ids' => $clientUserIds,
                'message' => $message
            ]);
        } else {
            Log::warning('⚠️ No client users found for project notification', [
                'project_id' => $project->id,
                'project_client_id' => $project->client_id
            ]);
        }
    }
    
    /**
     * Helper function to trigger worker notification when company approves/rejects task
     */
    private function triggerWorkerNotification($task, $project, $actionType, $customMessage = null)
    {
        // Get worker user IDs who are assigned to this task
        $workerUserIds = $task->taskWorkers()
            ->with('projectTeam.user')
            ->get()
            ->map(function ($taskWorker) {
                return $taskWorker->projectTeam->user_id ?? null;
            })
            ->filter()
            ->unique()
            ->values()
            ->toArray();

        if (!empty($workerUserIds)) {
            // Dispatch event to notify workers
            event(new NewWorkerTaskNotification(
                $task,
                $project,
                $workerUserIds,
                $actionType,
                $customMessage
            ));

            Log::info('🔔 Worker notification triggered', [
                'task_id' => $task->id,
                'project_id' => $project->id,
                'action_type' => $actionType,
                'worker_count' => count($workerUserIds),
                'worker_user_ids' => $workerUserIds
            ]);
        } else {
            Log::warning('⚠️ No worker users found for task notification', [
                'task_id' => $task->id,
                'project_id' => $project->id
            ]);
        }
    }
    
    /**
     * Helper function to trigger approval notification to next role when task is forwarded
     */
    private function triggerApprovalNotificationForNextRole($task, $nextRole, $customMessage = null)
    {
        // Find users with the next approval role in this project
        $nextRoleUserIds = ProjectTeam::where('project_id', $task->project->id)
            ->where('role', $nextRole)
            ->pluck('user_id')
            ->toArray();

        if (!empty($nextRoleUserIds)) {
            // Use existing NewApprovalNotification event
            event(new NewApprovalNotification(
                $task,
                $nextRoleUserIds,
                $customMessage ?? "Task '{$task->name}' requires your approval"
            ));

            Log::info('🔔 Approval notification triggered for next role', [
                'task_id' => $task->id,
                'project_id' => $task->project->id,
                'next_role' => $nextRole,
                'user_count' => count($nextRoleUserIds),
                'user_ids' => $nextRoleUserIds
            ]);
        } else {
            Log::warning('⚠️ No users found for next approval role', [
                'task_id' => $task->id,
                'project_id' => $task->project->id,
                'next_role' => $nextRole
            ]);
        }
    }
}
