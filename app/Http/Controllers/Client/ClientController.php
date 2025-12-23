<?php

namespace App\Http\Controllers\Client;

use App\Events\NewWorkerTaskNotification;
use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use App\Models\News;
use App\Services\SafeTransactionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ClientController extends Controller
{
    /**
     * Display client dashboard.
     */
    public function dashboard()
    {
        $user = Auth::user();

        $user = User::findOrFail($user->id);
        
        // Eager load client relationship
        $user->load('belongsToClient');
        $client = $user->belongsToClient;
        
        // Check if user has client_id and client exists
        $hasClient = $user->client_id !== null && $client !== null;
        
        // Get client name for denormalized queries
        $clientName = $hasClient ? $client->name : '';
        
        // 1. Project Statistics - exclude Draft and archived projects
        $projectStats = [
            'total' => $hasClient 
                ? Project::where('client_id', $user->client_id)
                    ->where('status', '!=', 'Draft')
                    ->where('is_archived', false)
                    ->count()
                : 0,
            'in_progress' => $hasClient 
                ? Project::where('client_id', $user->client_id)
                    ->where('status', 'In Progress')
                    ->where('is_archived', false)
                    ->count()
                : 0,
            'completed' => $hasClient 
                ? Project::where('client_id', $user->client_id)
                    ->where('status', 'Completed')
                    ->where('is_archived', false)
                    ->count()
                : 0,
            'suspended' => $hasClient 
                ? Project::where('client_id', $user->client_id)
                    ->where('status', 'Suspended')
                    ->where('is_archived', false)
                    ->count()
                : 0,
            'canceled' => $hasClient 
                ? Project::where('client_id', $user->client_id)
                    ->where('status', 'Canceled')
                    ->where('is_archived', false)
                    ->count()
                : 0,
        ];
        
        // Get project IDs for task queries - exclude Draft and archived
        $projectIds = $hasClient 
            ? Project::where('client_id', $user->client_id)
                ->where('status', '!=', 'Draft')
                ->where('is_archived', false)
                ->pluck('id')
            : collect([]);
        
        // 2. Task Statistics (menggunakan completion_status yang benar)
        $taskStats = [
            'total' => $projectIds->isNotEmpty()
                ? Task::whereIn('project_id', $projectIds)->count()
                : 0,
            'completed' => $projectIds->isNotEmpty()
                ? Task::whereIn('project_id', $projectIds)
                    ->where('completion_status', 'completed')
                    ->count()
                : 0,
            'in_progress' => $projectIds->isNotEmpty()
                ? Task::whereIn('project_id', $projectIds)
                    ->where('completion_status', 'in_progress')
                    ->count()
                : 0,
            'pending' => $projectIds->isNotEmpty()
                ? Task::whereIn('project_id', $projectIds)
                    ->where('completion_status', 'pending')
                    ->count()
                : 0,
        ];
        
        // Get task assignment IDs for document queries
        $taskIds = $projectIds->isNotEmpty() 
            ? Task::whereIn('project_id', $projectIds)->pluck('id')
            : collect([]);
        
        $taskAssignmentIds = $taskIds->isNotEmpty()
            ? \App\Models\TaskAssignment::whereIn('task_id', $taskIds)->pluck('id')
            : collect([]);
        
        // 3. Document Statistics
        $documentStats = [
            'total_documents' => $taskAssignmentIds->isNotEmpty()
                ? \App\Models\Document::whereIn('task_assignment_id', $taskAssignmentIds)->count()
                : 0,
            'client_documents' => $taskAssignmentIds->isNotEmpty()
                ? \App\Models\ClientDocument::whereIn('task_assignment_id', $taskAssignmentIds)->count()
                : 0,
        ];
        
        // 4. Recent Projects (last 5) - exclude Draft and archived
        $recentProjects = $hasClient
            ? Project::where('client_id', $user->client_id)
                ->where('status', '!=', 'Draft')
                ->where('is_archived', false)
                ->withCount(['workingSteps', 'tasks'])
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get()
                ->map(function($project) {
                    return [
                        'id' => $project->id,
                        'name' => $project->name,
                        'status' => $project->status,
                        'working_steps_count' => $project->working_steps_count,
                        'tasks_count' => $project->tasks_count,
                        'created_at' => $project->created_at->format('Y-m-d H:i:s'),
                    ];
                })
            : collect([]);
        
        // 5. Tasks Requiring Client Action (client_interact = 'upload', latest assignment status = 'Submitted to Client')
        $tasksRequiringAction = $projectIds->isNotEmpty()
            ? Task::whereIn('project_id', $projectIds)
                ->where('client_interact', 'upload') // Only tasks with upload permission need client action
                ->where('completion_status', '!=', 'completed')
                ->whereHas('taskAssignments', function($query) {
                    // Check if latest assignment has status 'Submitted to Client'
                    $query->whereIn('id', function($subQuery) {
                        $subQuery->select(DB::raw('MAX(id)'))
                            ->from('task_assignments')
                            ->groupBy('task_id');
                    })
                    ->where('status', 'Submitted to Client');
                })
                ->with(['taskAssignments' => function($q) {
                    $q->latest()->limit(1);
                }])
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get()
                ->map(function($task) {
                    $latestAssignment = $task->taskAssignments->first();
                    return [
                        'id' => $task->id,
                        'name' => $task->name,
                        'project_name' => $task->project_name,
                        'working_step_name' => $task->working_step_name,
                        'status' => $latestAssignment->status ?? 'Draft',
                        'completion_status' => $task->completion_status,
                        'created_at' => $task->created_at->format('Y-m-d H:i:s'),
                    ];
                })
            : collect([]);
        
        // 6. Task Progress Trend (last 7 days) - berdasarkan completion_status
        $taskTrend = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $count = $projectIds->isNotEmpty()
                ? Task::whereIn('project_id', $projectIds)
                    ->where('completion_status', 'completed')
                    ->whereDate('updated_at', $date->format('Y-m-d'))
                    ->count()
                : 0;
            
            $taskTrend[] = [
                'date' => $date->format('Y-m-d'),
                'count' => $count,
            ];
        }
        
        // 7. Recent Activity Logs (last 10) - simplified query
        $recentActivities = $hasClient && !empty($clientName)
            ? \App\Models\ActivityLog::where(function($query) use ($user, $clientName) {
                // Activities on projects belonging to this client
                $query->where('action_type', 'project')
                    ->where(function($q) use ($user, $clientName) {
                        $q->where('target_name', 'like', "%{$clientName}%")
                          ->orWhereRaw("JSON_EXTRACT(meta, '$.client_id') = ?", [$user->client_id]);
                    });
            })
            ->orWhere(function($query) use ($clientName) {
                // Activities on tasks belonging to this client's projects
                $query->where('action_type', 'task')
                    ->where('target_name', 'like', "%{$clientName}%");
            })
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function($log) {
                return [
                    'id' => $log->id,
                    'user_name' => $log->user_name ?? 'System',
                    'action_type' => $log->action_type,
                    'action' => $log->action,
                    'target_name' => $log->target_name ?? 'Unknown',
                    'description' => $log->description,
                    'created_at' => $log->created_at->format('Y-m-d H:i:s'),
                ];
            })
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
                        'name' => $news->creator ? $news->creator->name : 'Unknown',
                    ],
                ];
            });

        return Inertia::render('Client/Dashboard', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => [
                    'name' => $user->role,
                    'display_name' => ucfirst($user->role),
                    'description' => 'Client User',
                ],
                'client' => $hasClient ? [
                    'id' => $client->id,
                    'name' => $client->name,
                    'alamat' => $client->alamat,
                    'kementrian' => $client->kementrian,
                    'kode_satker' => $client->kode_satker,
                ] : null,
            ],
            'statistics' => [
                'projects' => $projectStats,
                'tasks' => $taskStats,
                'documents' => $documentStats,
            ],
            'recentProjects' => $recentProjects,
            'tasksRequiringAction' => $tasksRequiringAction,
            'taskTrend' => $taskTrend,
            'recentActivities' => $recentActivities,
            'latestNews' => $latestNews,
        ]);
    }

    /**
     * Display client's projects.
     */
    public function myProjects(Request $request)
    {
        $user = Auth::user();
        
        // Get filter parameters - only allow certain statuses for clients
        $status = $request->get('status', 'In Progress');
        $allowedStatuses = ['In Progress', 'Completed', 'Suspended', 'Canceled'];
        if (!in_array($status, $allowedStatuses)) {
            $status = 'In Progress';
        }
        $search = $request->get('search');

        // Get status counts - exclude Draft and archived
        $statusCounts = [
            'in_progress' => Project::where('client_id', $user->client_id)
                ->where('status', 'In Progress')
                ->where('is_archived', false)
                ->count(),
            'completed' => Project::where('client_id', $user->client_id)
                ->where('status', 'Completed')
                ->where('is_archived', false)
                ->count(),
            'suspended' => Project::where('client_id', $user->client_id)
                ->where('status', 'Suspended')
                ->where('is_archived', false)
                ->count(),
            'canceled' => Project::where('client_id', $user->client_id)
                ->where('status', 'Canceled')
                ->where('is_archived', false)
                ->count(),
        ];

        // Build query - exclude Draft and archived
        $query = Project::where('client_id', $user->client_id)
            ->where('status', $status)
            ->where('is_archived', false)
            ->withCount(['workingSteps', 'tasks'])
            ->with(['client', 'projectTeams.user']);

        // Apply search filter
        if ($search) {
            $query->where('name', 'like', "%{$search}%");
        }

        $projects = $query->latest()->paginate(10)->withQueryString();
        
        // Calculate progress and format team data for each project
        $projects->getCollection()->transform(function($project) {
            // Calculate completion percentage
            $allTasks = \App\Models\Task::where('project_id', $project->id)->get();
            $completedTasks = $allTasks->where('completion_status', 'completed')->count();
            $totalTasks = $allTasks->count();
            $completionPercentage = $totalTasks > 0 ? round(($completedTasks / $totalTasks) * 100) : 0;
            
            // Format team members
            $teamMembers = $project->projectTeams->take(5)->map(function($team) {
                return [
                    'id' => $team->id,
                    'user_name' => $team->user_name,
                    'role' => $team->role,
                    'user' => $team->user ? [
                        'id' => $team->user->id,
                        'name' => $team->user->name,
                        'profile_photo' => $team->user->profile_photo,
                        'position' => $team->user->position,
                    ] : null
                ];
            });
            
            $project->completion_percentage = $completionPercentage;
            $project->completed_tasks = $completedTasks;
            $project->total_tasks = $totalTasks;
            $project->team_members = $teamMembers;
            $project->team_count = $project->projectTeams->count();
            
            return $project;
        });

        return Inertia::render('Client/Projects/Index', [
            'projects' => $projects,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
            'statusCounts' => $statusCounts,
        ]);
    }

    /**
     * Display a specific project.
     */
    public function showProject(Project $project)
    {
        // Make sure client can only view their own projects
        if ($project->client_id !== Auth::user()->client_id) {
            abort(403, 'Unauthorized access to this project.');
        }
        
        // Don't allow access to Draft or archived projects
        if ($project->status === 'Draft' || $project->is_archived) {
            abort(404, 'Project not found.');
        }

        // Get project team members
        $projectTeams = \App\Models\ProjectTeam::where('project_id', $project->id)
            ->with('user') // Only load user, no role relationship
            ->orderBy('role')
            ->orderBy('user_name')
            ->get()
            ->map(function($team) {
                return [
                    'id' => $team->id,
                    'user_name' => $team->user_name,
                    'user_email' => $team->user_email,
                    'user_position' => $team->user_position,
                    'role' => $team->role,
                    'user' => $team->user ? [
                        'id' => $team->user->id,
                        'name' => $team->user->name,
                        'email' => $team->user->email,
                        'position' => $team->user->position, // position is an enum field
                        'user_type' => $team->user->user_type, // user_type is an enum field
                        'profile_photo' => $team->user->profile_photo, // profile photo path
                        'whatsapp' => $team->user->whatsapp ?? null, // WhatsApp number
                    ] : null
                ];
            });

        // Get working steps with tasks and assignments
        $workingSteps = \App\Models\WorkingStep::where('project_id', $project->id)
            ->with(['tasks' => function($query) {
                $query->with([
                    'taskWorkers.projectTeam.user', // Load workers with user information
                    'taskAssignments' => function($q) {
                        $q->with(['documents', 'clientDocuments'])->orderBy('created_at', 'desc');
                    }
                ])->orderBy('order');
            }])
            ->orderBy('order')
            ->get()
            ->map(function($step) {
                // No need to check is_locked for clients
                // Client access is determined solely by task's client_interact flag
                
                return [
                    'id' => $step->id,
                    'name' => $step->name,
                    'slug' => $step->slug,
                    'order' => $step->order,
                    'is_locked' => false, // Always false for clients - not used
                    'can_access' => true, // Always true - access controlled by client_interact on tasks
                    'required_progress' => null,
                    'tasks' => $step->tasks->map(function($task) {
                        // Get latest assignment for display
                        $latestAssignment = $task->taskAssignments->first();
                        
                        // Get task workers with user information
                        $taskWorkers = $task->taskWorkers->map(function($worker) {
                            $user = $worker->projectTeam?->user;
                            return [
                                'id' => $worker->id,
                                'worker_name' => $worker->worker_name,
                                'worker_email' => $worker->worker_email,
                                'worker_role' => $worker->worker_role,
                                'user' => $user ? [
                                    'id' => $user->id,
                                    'name' => $user->name,
                                    'email' => $user->email,
                                    'profile_photo' => $user->profile_photo,
                                    'position' => $user->position,
                                ] : null
                            ];
                        });
                        
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
                            'is_assigned_to_me' => $task->client_interact !== 'read only', // Client can interact with 'restricted' or 'upload' tasks
                            'my_assignment_id' => null,
                            'workers' => $taskWorkers, // Add workers data
                            // Latest assignment info for display
                            'latest_assignment' => $latestAssignment ? [
                                'id' => $latestAssignment->id,
                                'time' => $latestAssignment->time,
                                'notes' => $latestAssignment->notes,
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

        return Inertia::render('Client/Projects/Show', [
            'project' => [
                'id' => $project->id,
                'name' => $project->name,
                'slug' => $project->slug,
                'status' => $project->status,
                'client_name' => $project->client_name,
                'client_alamat' => $project->client_alamat,
                'client_kementrian' => $project->client_kementrian,
                'client_kode_satker' => $project->client_kode_satker,
                'created_at' => $project->created_at,
                'updated_at' => $project->updated_at,
            ],
            'workingSteps' => $workingSteps,
            'projectTeams' => $projectTeams,
        ]);
    }

    /**
     * View task details (read-only for client).
     */
    public function viewTask(Task $task)
    {
        // Make sure client can only view tasks from their projects
        if ($task->project->client_id !== Auth::user()->client_id) {
            abort(403, 'Unauthorized access to this task.');
        }
        
        // Don't allow access to tasks from Draft or archived projects
        if ($task->project->status === 'Draft' || $task->project->is_archived) {
            abort(404, 'Task not found.');
        }

        // 📖 MARK RELATED NOTIFICATIONS AS READ
        \App\Models\Notification::where('user_id', Auth::id())
            ->whereNull('read_at')
            ->where(function($query) use ($task) {
                // Mark notifications related to this specific task as read
                $query->whereRaw('JSON_EXTRACT(data, "$.task_id") = ?', [$task->id])
                      ->orWhere('url', 'like', '%/tasks/' . $task->id . '%')
                      ->orWhere('url', 'like', '%/klien/tasks/' . $task->id . '%');
            })
            ->update(['read_at' => now()]);

        Log::info('📖 Client task notifications marked as read', [
            'user_id' => Auth::id(),
            'task_id' => $task->id,
            'task_name' => $task->name
        ]);

        // Load task with all necessary relationships
        $task->load([
            'workingStep',
            'project',
            'taskAssignments' => function ($query) {
                // Filter only assignments with status "Submitted to Client" or "Client Reply"
                $query->whereIn('status', ['Submitted to Client', 'Client Reply', 'Under Review by Client', 'Approved by Client', 'Returned for Revision (by Client)', 'Completed'])
                      ->latest()
                      ->with([
                          'documents',
                          'clientDocuments'
                      ]);
            },
            'taskWorkers.projectTeam.user', // Load task workers
            'taskApprovals' => function ($query) {
                $query->orderBy('order', 'asc');
            }
        ]);

        // Get latest assignment from filtered results (should be "Submitted to Client" or "Client Reply")
        $latestAssignment = $task->taskAssignments()->orderBy('created_at', 'desc')->first();
        $canEdit = false;
        if ($latestAssignment->maker === 'company' && $latestAssignment->maker_can_edit === 1 && ($latestAssignment->status === 'Submitted to Client' || $latestAssignment->status === 'Under Review by Client')) {
            $latestAssignment->updateSafely([
                'status' => 'Under Review by Client',
                'maker_can_edit' => false
            ], $latestAssignment->version);
            $canEdit = true;
        } elseif ($latestAssignment->maker === 'company' && $latestAssignment->maker_can_edit === 0 && ($latestAssignment->status === 'Submitted to Client' || $latestAssignment->status === 'Under Review by Client')) {
            $latestAssignment->updateSafely([
                'status' => 'Under Review by Client'
            ], $latestAssignment->version);
            $canEdit = true;
        } elseif ($latestAssignment->maker === 'client' && $latestAssignment->maker_can_edit === 1 && $latestAssignment->status === 'Client Reply') {
            $canEdit = true;
        }

        // dd($canEdit);

        // $canEdit = $latestAssignment->maker === 'client' && $latestAssignment->status === 'Client Reply' && $latestAssignment->maker_can_edit === 1;

        // Find pending client documents from LATEST filtered assignment ONLY
        $pendingClientDocs = [];
        if ($latestAssignment && $latestAssignment->clientDocuments) {
            $pending = $latestAssignment->clientDocuments->filter(function ($doc) {
                // return !$doc->file; // Only docs without uploaded files
                return $doc; 
            });
            $pendingClientDocs = $pending->toArray();
        }

        // Format workers data
        $workers = $task->taskWorkers->map(function ($taskWorker) {
            $user = $taskWorker->projectTeam->user ?? null;
            
            return [
                'id' => $taskWorker->id,
                'worker_name' => $taskWorker->worker_name,
                'worker_email' => $taskWorker->worker_email,
                'worker_role' => $taskWorker->worker_role,
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'profile_photo' => $user->profile_photo,
                    'position' => $user->position,
                    'whatsapp' => $user->whatsapp ?? null,
                ] : null
            ];
        });

        // Format task data for React component (filtered assignments only)
        $taskData = [
            'id' => $task->id,
            'name' => $task->name,
            'slug' => $task->slug,
            'order' => $task->order,
            'is_required' => $task->is_required,
            'completion_status' => $task->completion_status,
            'status' => $latestAssignment->status ?? 'Draft',
            'client_interact' => $task->client_interact,
            'multiple_files' => $task->multiple_files,
            'project_name' => $task->project->name,
            'working_step_name' => $task->workingStep->name,
            'workers' => $workers,
            'can_edit' => $canEdit,
            'task_approvals' => $task->taskApprovals->map(function($approval) use ($task, $latestAssignment) {
                // Get approval/rejection logs for this approval role from current assignment
                $approvalLog = null;
                if ($latestAssignment) {
                    $approvalLog = \App\Models\ActivityLog::where('target_type', 'App\Models\Task')
                        ->where('target_id', $task->id)
                        ->where(function($query) {
                            $query->where('action_type', 'Task Approved')
                                  ->orWhere('action_type', 'Task Rejected')
                                  ->orWhere('action_type', 'task_approval');
                        })
                        ->whereRaw('JSON_EXTRACT(meta, "$.task_assignment_id") = ?', [$latestAssignment->id])
                        ->where(function($query) use ($approval) {
                            $query->whereRaw('JSON_EXTRACT(meta, "$.approval_role") = ?', [strtolower($approval->role)])
                                  ->orWhere('user_role', strtolower($approval->role));
                        })
                        ->with('user')
                        ->first();
                }

                $status = 'pending';
                $approvedBy = null;
                $approvedAt = null;
                $comment = null;

                if ($approvalLog) {
                    if ($approvalLog->action === 'approved') {
                        $status = 'approved';
                        $approvedBy = $approvalLog->user_name;
                        $approvedAt = $approvalLog->created_at;
                    } elseif ($approvalLog->action === 'rejected') {
                        $status = 'rejected';
                        $approvedBy = $approvalLog->user_name;
                        $approvedAt = $approvalLog->created_at;
                        $comment = $approvalLog->meta['rejection_comment'] ?? $approvalLog->description ?? null;
                    }
                } else if ($latestAssignment) {
                    // Fallback: determine status based on assignment status
                    $currentStatus = $latestAssignment->status;
                    
                    if ($currentStatus === $approval->status_name_complete) {
                        $status = 'approved';
                    } elseif ($currentStatus === $approval->status_name_reject) {
                        $status = 'rejected';
                    } elseif ($currentStatus === $approval->status_name_progress) {
                        $status = 'in-progress';
                    } else {
                        // If assignment reached "Submitted to Client", "Under Review by Client", or "Approved by Client"
                        // then ALL previous approval levels must have been completed
                        if (in_array($currentStatus, ['Submitted to Client', 'Under Review by Client', 'Approved by Client', 'Client Reply'])) {
                            $status = 'approved';
                        } else {
                            // Check if this approval level has been passed
                            $approvals = $task->taskApprovals->sortBy('order');
                            $currentApprovalIndex = $approvals->search(function($item) use ($approval) {
                                return $item->id === $approval->id;
                            });
                            
                            // If current status indicates we're past this approval level
                            foreach ($approvals as $index => $app) {
                                if ($index < $currentApprovalIndex) {
                                    if ($currentStatus === $app->status_name_complete || 
                                        in_array($currentStatus, ['Submitted to Client', 'Under Review by Client', 'Approved by Client'])) {
                                        $status = 'approved';
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
                
                return [
                    'id' => $approval->id,
                    'order' => $approval->order,
                    'role' => $approval->role,
                    'task_name' => $approval->task_name,
                    'working_step_name' => $approval->working_step_name,
                    'project_name' => $approval->project_name,
                    'project_client_name' => $approval->project_client_name,
                    'status_name_pending' => $approval->status_name_pending,
                    'status_name_progress' => $approval->status_name_progress,
                    'status_name_reject' => $approval->status_name_reject,
                    'status_name_complete' => $approval->status_name_complete,
                    'status' => $status,
                    'approved_by' => $approvedBy,
                    'approved_at' => $approvedAt,
                    'comment' => $comment,
                ];
            })->sortBy('order')->values(),
            'latest_assignment' => $latestAssignment ? [
                'id' => $latestAssignment->id,
                'time' => $latestAssignment->time,
                'notes' => $latestAssignment->notes,
                'comment' => $latestAssignment->comment,
                'client_comment' => $latestAssignment->client_comment,
                'created_at' => $latestAssignment->created_at,
                'documents' => $latestAssignment->documents,
                'client_documents' => $latestAssignment->clientDocuments,
                // No user relation in TaskAssignment model
            ] : null,
            // Include filtered assignments (only "Submitted to Client" and "Client Reply") with approval workflow
            'assignments' => $task->taskAssignments->map(function ($assignment) use ($task) {
                // Get approval workflow for this specific assignment
                $approvalWorkflow = $task->taskApprovals->map(function ($approval) use ($assignment, $task) {
                    // Get approval/rejection logs for this specific assignment and role
                    $approvalLog = \App\Models\ActivityLog::where('target_type', 'App\Models\Task')
                        ->where('target_id', $task->id)
                        ->where(function($query) {
                            $query->where('action_type', 'Task Approved')
                                  ->orWhere('action_type', 'Task Rejected')
                                  ->orWhere('action_type', 'task_approval');
                        })
                        ->whereRaw('JSON_EXTRACT(meta, "$.task_assignment_id") = ?', [$assignment->id])
                        ->where(function($query) use ($approval) {
                            $query->whereRaw('JSON_EXTRACT(meta, "$.approval_role") = ?', [strtolower($approval->role)])
                                  ->orWhere('user_role', strtolower($approval->role));
                        })
                        ->with('user')
                        ->first();

                    $status = 'pending';
                    $approvedBy = null;
                    $approvedAt = null;
                    $comment = null;

                    if ($approvalLog) {
                        if ($approvalLog->action === 'approved') {
                            $status = 'approved';
                            $approvedBy = $approvalLog->user_name;
                            $approvedAt = $approvalLog->created_at;
                        } elseif ($approvalLog->action === 'rejected') {
                            $status = 'rejected';
                            $approvedBy = $approvalLog->user_name;
                            $approvedAt = $approvalLog->created_at;
                            $comment = $approvalLog->meta['rejection_comment'] ?? $approvalLog->description ?? null;
                        }
                    } else {
                        // Fallback: determine status based on assignment status
                        $currentStatus = $assignment->status;
                        
                        if ($currentStatus === $approval->status_name_complete) {
                            $status = 'approved';
                        } elseif ($currentStatus === $approval->status_name_reject) {
                            $status = 'rejected';
                        } elseif ($currentStatus === $approval->status_name_progress) {
                            $status = 'in-progress';
                        } else {
                            // If assignment reached "Submitted to Client", "Under Review by Client", or "Approved by Client"
                            // then ALL previous approval levels must have been completed
                            if (in_array($currentStatus, ['Submitted to Client', 'Under Review by Client', 'Approved by Client', 'Client Reply'])) {
                                $status = 'approved';
                            } else {
                                // Check if this approval level has been passed
                                $approvals = $task->taskApprovals->sortBy('order');
                                $currentApprovalIndex = $approvals->search(function($item) use ($approval) {
                                    return $item->id === $approval->id;
                                });
                                
                                // If current status indicates we're past this approval level
                                foreach ($approvals as $index => $app) {
                                    if ($index < $currentApprovalIndex) {
                                        if ($currentStatus === $app->status_name_complete || 
                                            in_array($currentStatus, ['Submitted to Client', 'Under Review by Client', 'Approved by Client'])) {
                                            $status = 'approved';
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    }

                    return [
                        'role' => $approval->role,
                        'order' => $approval->order,
                        'status' => $status,
                        'approved_by' => $approvedBy,
                        'approved_at' => $approvedAt,
                        'comment' => $comment,
                    ];
                })->sortBy('order')->values();

                return [
                    'id' => $assignment->id,
                    'time' => $assignment->time,
                    'notes' => $assignment->notes,
                    'comment' => $assignment->comment,
                    'client_comment' => $assignment->client_comment,
                    'created_at' => $assignment->created_at,
                    'status' => $assignment->status,
                    'documents' => $assignment->documents,
                    'client_documents' => $assignment->clientDocuments,
                    'approval_workflow' => $approvalWorkflow,
                    // No user relation in TaskAssignment model
                ];
            }),
        ];

        // dd($pendingClientDocs);

        return Inertia::render('Client/Projects/TaskDetail', [
            'task' => $taskData,
            'project' => [
                'id' => $task->project->id,
                'name' => $task->project->name,
                'slug' => $task->project->slug,
                'status' => $task->project->status,
            ],
            'pendingClientDocs' => $pendingClientDocs,
        ]);
    }

    /**
     * Upload client documents for a task.
     */
    public function uploadClientDocuments(Request $request, Task $task)
    {
        try {
            return SafeTransactionService::executeWithRetry(function () use ($request, $task) {
                // Make sure client can only upload to their own projects
                if ($task->project->client_id !== Auth::user()->client_id) {
                    abort(403, 'Unauthorized access to this task.');
                }
                
                // Don't allow access to tasks from Draft or archived projects
                if ($task->project->status === 'Draft' || $task->project->is_archived) {
                    abort(404, 'Task not found.');
                }

                // Validate that this task allows client upload
                if ($task->client_interact !== 'upload') {
                    return back()->with('error', 'Task ini tidak memerlukan upload file dari client.');
                }

                $request->validate([
                    'client_comment' => 'nullable|string|max:1000',
                    'client_document_files' => 'nullable|array',
                    'client_document_files.*' => 'nullable|file|mimes:pdf,doc,docx,xls,xlsx,jpg,jpeg,png|max:10240', // 10MB max
                ]);

                // Get latest assignment with row-level locking
                $latestAssignment = $task->taskAssignments()
                    ->latest()
                    ->lockForUpdate()
                    ->first();

                if (!$latestAssignment) {
                    return back()->with('error', 'Tidak ada assignment untuk task ini.');
                }

                // Update client comment if provided using optimistic locking
                if ($request->client_comment) {
                    $latestAssignment->updateSafely([
                        'client_comment' => $request->client_comment,
                    ], $latestAssignment->version);
                }

                // Upload files for client documents
                if ($request->hasFile('client_document_files')) {
                    foreach ($request->file('client_document_files') as $docId => $file) {
                        // Find the client document with locking
                        $clientDoc = \App\Models\ClientDocument::where('id', $docId)
                            ->lockForUpdate()
                            ->first();
                        
                        if ($clientDoc && $clientDoc->task_assignment_id === $latestAssignment->id && !$clientDoc->file) {
                            // Get task model and proper storage path
                            $taskModel = \App\Models\Task::find($task->id);
                            $storageRelativePath = $taskModel->getStoragePath();
                            
                            // Store the file in the task's directory
                            $fileName = time() . '_' . $file->getClientOriginalName();
                            $filePath = $file->storeAs($storageRelativePath, $fileName, 'public');
                            
                            // Update client document safely
                            $clientDoc->updateSafely([
                                'file' => $filePath,
                                'uploaded_at' => now(),
                            ], $clientDoc->version);

                            // Log activity
                            \App\Models\ActivityLog::create([
                                'user_id' => Auth::id(),
                                'user_name' => Auth::user()->name,
                                'action_type' => 'client_document',
                                'action' => 'uploaded',
                                'target_type' => 'App\Models\ClientDocument',
                                'target_id' => $clientDoc->id,
                                'target_name' => $clientDoc->name,
                                'description' => "Client uploaded document: {$clientDoc->name} for task: {$task->name}",
                                'meta' => [
                                    'task_id' => $task->id,
                                    'task_name' => $task->name,
                                    'assignment_id' => $latestAssignment->id,
                                    'document_id' => $clientDoc->id,
                                ],
                                'ip_address' => $request->ip(),
                                'user_agent' => $request->header('User-Agent')
                            ]);
                        }
                    }
                }

                // Check if all client documents have been uploaded
                $allClientDocs = \App\Models\ClientDocument::where('task_assignment_id', $latestAssignment->id)
                    ->lockForUpdate()
                    ->get();
                
                $allUploaded = $allClientDocs->every(function($doc) {
                    return $doc->file !== null;
                });

                // Update assignment status to Client Reply if all documents uploaded
                $currentStatus = $latestAssignment->status ?? 'Draft';
                if ($allUploaded && ($currentStatus === 'Submitted to Client' || $currentStatus === 'Submitted')) {
                    // Check if already updated by another concurrent request
                    if ($latestAssignment->status === 'Client Reply') {
                        return back()->with('info', 'All documents already uploaded and processed.');
                    }

                    // Update assignment status safely
                    $latestAssignment->updateSafely([
                        'status' => 'Client Reply',
                        'maker' => 'client',
                        'maker_can_edit' => true,
                    ], $latestAssignment->version);
                    
                    // Update task completion status safely
                    $task->updateSafely([
                        'completion_status' => 'in_progress',
                    ], $task->version);

                    // Log activity
                    \App\Models\ActivityLog::create([
                        'user_id' => Auth::id(),
                        'user_name' => Auth::user()->name,
                        'action_type' => 'task',
                        'action' => 'client_reply',
                        'target_type' => 'App\Models\Task',
                        'target_id' => $task->id,
                        'target_name' => $task->name,
                        'description' => "Client completed all document uploads for task: {$task->name}",
                        'meta' => [
                            'task_id' => $task->id,
                            'project_id' => $task->project_id,
                            'assignment_id' => $latestAssignment->id,
                        ],
                        'ip_address' => $request->ip(),
                        'user_agent' => $request->header('User-Agent')
                    ]);
                }

                // Trigger worker notification for client document upload
                $this->triggerWorkerNotification(
                    $task, 
                    $task->project, 
                    'client_uploaded', 
                    "Client uploaded documents for task '{$task->name}' in project '{$task->project->name}'"
                );

                return back()->with('success', 'Dokumen berhasil diupload!');
            });

        } catch (\Exception $e) {
            Log::error('Client document upload failed', [
                'task_id' => $task->id,
                'client_id' => Auth::user()->client_id,
                'error' => $e->getMessage()
            ]);

            return back()->with('error', 'Gagal mengupload dokumen: ' . $e->getMessage());
        }
    }

    /**
     * Submit task reply with direct file upload.
     */
    public function submitTaskReply(Request $request, Task $task)
    {
        // Make sure client can only upload to their own projects
        if ($task->project->client_id !== Auth::user()->client_id) {
            abort(403, 'Unauthorized access to this task.');
        }
        
        // Don't allow access to tasks from Draft or archived projects
        if ($task->project->status === 'Draft' || $task->project->is_archived) {
            abort(404, 'Task not found.');
        }

        // Validate that this task allows client interaction (not 'read only')
        if ($task->client_interact === 'read only') {
            return back()->with('error', 'Task ini tidak memerlukan input dari client.');
        }

        // dd($request->all());

        $request->validate([
            'client_comment' => 'nullable|string|max:1000',
            'files' => 'nullable|array',
            'files.*' => 'nullable|file|mimes:pdf,doc,docx,xls,xlsx,jpg,jpeg,png|max:10240', // 10MB max
            'file_labels' => 'nullable|array',
            'file_labels.*' => 'nullable|string|max:255',
            'client_document_ids' => 'nullable|array',
            'client_document_ids.*' => 'nullable|string|exists:client_documents,id',
        ]);

        // Get the latest task assignment (should be "Submitted to Client" status from company)
        $latestAssignment = $task->taskAssignments()->latest()->first();

        if (!$latestAssignment || ($latestAssignment->status !== 'Submitted to Client' && $latestAssignment->status !== 'Under Review by Client' && $latestAssignment->status !== 'Client Reply')) {
            return back()->with('error', 'Tidak ada permintaan yang perlu dibalas untuk task ini.');
        }
        
        $hasFiles = $request->hasFile('files');
        $hasComment = !empty($request->client_comment);
        
        // Always update existing assignment, never create new one
        // Client reply is filling the existing assignment created by company
        $latestAssignment->updateSafely([
            'client_comment' => $request->client_comment,
            'status' => 'Client Reply',
            'maker' => 'client',
            'maker_can_edit' => true,
        ], $latestAssignment->version);
        
        $assignment = $latestAssignment;

        // Upload files to existing client documents
        if ($hasFiles) {
            $files = $request->file('files');
            $file_labels = $request->file_labels ?? [];
            $client_document_ids = $request->client_document_ids ?? [];
            
            foreach ($files as $index => $file) {
                // Find corresponding client document by ID if provided, otherwise by index
                $clientDocId = $client_document_ids[$index] ?? null;
                
                if ($clientDocId) {
                    $clientDoc = \App\Models\ClientDocument::where('id', $clientDocId)
                    ->where('task_assignment_id', $assignment->id)
                    ->first();
                } else {
                    // Fallback: get pending client documents by index
                    $pendingClientDocs = $assignment->clientDocuments()->whereNull('file')->get();
                    $clientDoc = $pendingClientDocs->get($index);
                }
                
                // if ($clientDoc && !$clientDoc->file) {
                if ($clientDoc) {
                    // Get task for proper file storage path
                    $taskModel = \App\Models\Task::find($task->id);
                    $storageRelativePath = $taskModel->getStoragePath();
                    
                    // Store the file in the task's directory
                    $fileName = time() . '_' . $index . '_' . $file->getClientOriginalName();
                    $filePath = $file->storeAs($storageRelativePath, $fileName, 'public');
                    
                    // Update existing client document with file safely
                    $clientDoc->updateSafely([
                        'file' => $filePath,
                        'uploaded_at' => now(),
                        'description' => $file_labels[$index] ?? $clientDoc->description ?? 'Uploaded by client',
                    ], $clientDoc->version);
                }
            }
        }

        // Log activity with more specific description
        $actionDescription = '';
        if ($hasComment && $hasFiles) {
            $actionDescription = "Client submitted comment and uploaded " . count($request->file('files')) . " file(s) for task: {$task->name}";
        } elseif ($hasComment) {
            $actionDescription = "Client submitted comment for task: {$task->name}";
        } elseif ($hasFiles) {
            $actionDescription = "Client uploaded " . count($request->file('files')) . " file(s) for task: {$task->name}";
        }

        \App\Models\ActivityLog::create([
            'user_id' => Auth::id(),
            'user_name' => Auth::user()->name,
            'action_type' => 'task',
            'action' => $hasFiles ? 'client_upload' : 'client_comment',
            'target_name' => $task->name,
            'description' => $actionDescription,
            'meta' => json_encode([
                'task_id' => $task->id,
                'project_id' => $task->project_id,
                'assignment_id' => $assignment->id,
                'files_count' => $hasFiles ? count($request->file('files')) : 0,
                'has_comment' => $hasComment,
                'interaction_type' => $task->client_interact,
            ]),
        ]);

        $successMessage = '';
        if ($hasComment && $hasFiles) {
            $successMessage = 'Komentar dan file berhasil dikirim!';
        } elseif ($hasComment) {
            $successMessage = 'Komentar berhasil dikirim!';
        } elseif ($hasFiles) {
            $successMessage = 'File berhasil diupload!';
        }

        // Trigger worker notification for client reply
        $this->triggerWorkerNotification(
            $task, 
            $task->project, 
            'client_replied', 
            "Client replied to task '{$task->name}' in project '{$task->project->name}'"
        );

        return back()->with('success', $successMessage);
    }

    /**
     * Approve or reject a task by client.
     */
    public function approveTask(Request $request, Task $task)
    {
        // Make sure client can only approve tasks from their projects
        if ($task->project->client_id !== Auth::user()->client_id) {
            abort(403, 'Unauthorized access to this task.');
        }

        // Validate that this task allows client approval
        if ($task->client_interact !== 'approval') {
            return back()->with('error', 'Task ini tidak memerlukan approval dari client.');
        }

        $request->validate([
            'action' => 'required|in:approve,reject',
            'client_comment' => 'nullable|string|max:1000',
        ]);

        // Get the latest task assignment (should be "Submitted to Client" status from company)
        $latestAssignment = $task->taskAssignments()->latest()->first();
        
        if (!$latestAssignment || ($latestAssignment->status !== 'Submitted to Client' && $latestAssignment->status !== 'Under Review by Client' && $latestAssignment->status !== 'Client Reply')) {
            return back()->with('error', 'Tidak ada permintaan approval untuk task ini.');
        }

        $action = $request->action;
        $clientComment = $request->client_comment;

        if ($action === 'approve') {
            // Update assignment status to Client Approved safely
            $latestAssignment->updateSafely([
                'status' => 'Approved by Client',
                'client_comment' => $clientComment,
            ], $latestAssignment->version);
            
            // Mark task as completed
            $task->markAsCompleted();

            // Log activity
            \App\Models\ActivityLog::create([
                'user_id' => Auth::id(),
                'user_name' => Auth::user()->name,
                'action_type' => 'task_approval',
                'action' => 'approved',
                'target_name' => $task->name,
                'description' => "Client approved task: {$task->name}" . ($clientComment ? " with comment: {$clientComment}" : ''),
                'meta' => json_encode([
                    'task_id' => $task->id,
                    'project_id' => $task->project_id,
                    'assignment_id' => $latestAssignment->id,
                    'action' => 'approve',
                ]),
            ]);

            // Trigger worker notification for client approval
            $this->triggerWorkerNotification(
                $task, 
                $task->project, 
                'client_approved', 
                "Client approved your task '{$task->name}' in project '{$task->project->name}'"
            );

            $successMessage = 'Task berhasil di-approve!';
        } else {
            // Update assignment status to Client Rejected safely
            $latestAssignment->updateSafely([
                'status' => 'Returned for Revision (by Client)',
                'client_comment' => $clientComment,
            ], $latestAssignment->version);
            
            // Update task status back to in progress safely
            $task->updateSafely([
                'completion_status' => 'in_progress',
            ], $task->version);

            // Log activity
            \App\Models\ActivityLog::create([
                'user_id' => Auth::id(),
                'user_name' => Auth::user()->name,
                'action_type' => 'task_approval',
                'action' => 'rejected',
                'target_name' => $task->name,
                'description' => "Client rejected task: {$task->name}" . ($clientComment ? " with comment: {$clientComment}" : ''),
                'meta' => json_encode([
                    'task_id' => $task->id,
                    'project_id' => $task->project_id,
                    'assignment_id' => $latestAssignment->id,
                    'action' => 'reject',
                ]),
            ]);

            // Trigger worker notification for client rejection
            $this->triggerWorkerNotification(
                $task, 
                $task->project, 
                'client_returned', 
                "Client requested revision for your task '{$task->name}' in project '{$task->project->name}'"
            );

            $successMessage = 'Task berhasil di-reject. Tim akan melakukan revisi.';
        }

        return back()->with('success', $successMessage);
    }
    
    /**
     * Helper function to trigger worker notification when client interacts with task
     */
    private function triggerWorkerNotification($task, $project, $actionType, $customMessage = null)
    {
        // Get worker user IDs who are assigned to this task
        $workerUserIds = $task->taskWorkers()
            ->with('projectTeam.user')
            ->get()
            ->pluck('projectTeam.user.id')
            ->filter()
            ->unique()
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
                'project_id' => $project->id,
                'action_type' => $actionType
            ]);
        }
    }
}
