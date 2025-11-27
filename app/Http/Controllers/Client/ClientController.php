<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use App\Models\News;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
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
        
        // 1. Project Statistics
        $projectStats = [
            'total' => $hasClient 
                ? Project::where('client_id', $user->client_id)->count()
                : 0,
            'open' => $hasClient 
                ? Project::where('client_id', $user->client_id)->where('status', 'open')->count()
                : 0,
            'closed' => $hasClient 
                ? Project::where('client_id', $user->client_id)->where('status', 'closed')->count()
                : 0,
        ];
        
        // Get project IDs for task queries
        $projectIds = $hasClient 
            ? Project::where('client_id', $user->client_id)->pluck('id')
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
        
        // 4. Recent Projects (last 5)
        $recentProjects = $hasClient
            ? Project::where('client_id', $user->client_id)
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
        
        // Get filter parameters
        $status = $request->get('status', 'open');
        $search = $request->get('search');

        // Get status counts
        $statusCounts = [
            'open' => Project::where('client_id', $user->client_id)->where('status', 'open')->count(),
            'closed' => Project::where('client_id', $user->client_id)->where('status', 'closed')->count(),
        ];

        // Build query
        $query = Project::where('client_id', $user->client_id)
            ->where('status', $status)
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
                            'is_assigned_to_me' => $task->client_interact !== 'read only', // Client can interact with 'comment' or 'upload' tasks
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

        // Load task with all necessary relationships
        $task->load([
            'workingStep',
            'project',
            'taskAssignments' => function ($query) {
                // Filter only assignments with status "Submitted to Client" or "Client Reply"
                $query->whereIn('status', ['Submitted to Client', 'Client Reply', 'Completed'])
                      ->latest()
                      ->with([
                          'documents',
                          'clientDocuments'
                      ]);
            },
            'taskWorkers.projectTeam.user' // Load task workers
        ]);

        // Get latest assignment from filtered results (should be "Submitted to Client" or "Client Reply")
        $latestAssignment = $task->taskAssignments->first();
        
        // Find pending client documents from LATEST filtered assignment ONLY
        $pendingClientDocs = [];
        if ($latestAssignment && $latestAssignment->clientDocuments) {
            $pending = $latestAssignment->clientDocuments->filter(function ($doc) {
                return !$doc->file; // Only docs without uploaded files
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
            // Include filtered assignments (only "Submitted to Client" and "Client Reply")
            'assignments' => $task->taskAssignments->map(function ($assignment) {
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
                    // No user relation in TaskAssignment model
                ];
            }),
        ];

        return Inertia::render('Client/Projects/TaskDetail', [
            'task' => $taskData,
            'project' => [
                'id' => $task->project->id,
                'name' => $task->project->name,
                'slug' => $task->project->slug,
            ],
            'pendingClientDocs' => $pendingClientDocs,
        ]);
    }

    /**
     * Upload client documents for a task.
     */
    public function uploadClientDocuments(Request $request, Task $task)
    {
        // Make sure client can only upload to their own projects
        if ($task->project->client_id !== Auth::user()->client_id) {
            abort(403, 'Unauthorized access to this task.');
        }

        // Validate that this task allows client upload (not 'read only' or 'comment')
        if ($task->client_interact !== 'upload') {
            return back()->with('error', 'Task ini tidak memerlukan upload file dari client.');
        }

        $request->validate([
            'client_comment' => 'nullable|string|max:1000',
            'client_document_files' => 'nullable|array',
            'client_document_files.*' => 'nullable|file|mimes:pdf,doc,docx,xls,xlsx,jpg,jpeg,png|max:10240', // 10MB max
        ]);

        // Get latest assignment
        $latestAssignment = $task->taskAssignments()->latest()->first();

        if (!$latestAssignment) {
            return back()->with('error', 'Tidak ada assignment untuk task ini.');
        }

        // Update client comment if provided
        if ($request->client_comment) {
            $latestAssignment->update([
                'client_comment' => $request->client_comment,
            ]);
        }

        // Upload files for client documents
        if ($request->hasFile('client_document_files')) {
            foreach ($request->file('client_document_files') as $docId => $file) {
                // Find the client document
                $clientDoc = \App\Models\ClientDocument::find($docId);
                
                if ($clientDoc && $clientDoc->task_assignment_id === $latestAssignment->id && !$clientDoc->file) {
                    // Store the file
                    $fileName = time() . '_' . $file->getClientOriginalName();
                    $filePath = $file->storeAs('client_documents', $fileName, 'public');
                    
                    // Update client document
                    $clientDoc->update([
                        'file' => $filePath,
                        'uploaded_at' => now(),
                    ]);

                    // Log activity
                    \App\Models\ActivityLog::create([
                        'user_id' => Auth::id(),
                        'user_name' => Auth::user()->name,
                        'action_type' => 'client_document',
                        'action' => 'uploaded',
                        'target_name' => $clientDoc->name,
                        'description' => "Client uploaded document: {$clientDoc->name} for task: {$task->name}",
                        'meta' => json_encode([
                            'task_id' => $task->id,
                            'task_name' => $task->name,
                            'assignment_id' => $latestAssignment->id,
                            'document_id' => $clientDoc->id,
                        ]),
                    ]);
                }
            }
        }

        // Check if all client documents have been uploaded
        $allClientDocs = \App\Models\ClientDocument::where('task_assignment_id', $latestAssignment->id)->get();
        $allUploaded = $allClientDocs->every(function($doc) {
            return $doc->file !== null;
        });

        // Update assignment status to Client Reply if all documents uploaded
        // Allow status update from both "Submitted to Client" and "Submitted"
        $currentStatus = $latestAssignment->status ?? 'Draft';
        if ($allUploaded && ($currentStatus === 'Submitted to Client' || $currentStatus === 'Submitted')) {
            // Update assignment status to Client Reply
            $latestAssignment->update([
                'status' => 'Client Reply',
            ]);
            
            // Update task completion status
            $task->update([
                'completion_status' => 'in_progress',
            ]);

            // Log activity
            \App\Models\ActivityLog::create([
                'user_id' => Auth::id(),
                'user_name' => Auth::user()->name,
                'action_type' => 'task',
                'action' => 'client_reply',
                'target_name' => $task->name,
                'description' => "Client completed all document uploads for task: {$task->name}",
                'meta' => json_encode([
                    'task_id' => $task->id,
                    'project_id' => $task->project_id,
                    'assignment_id' => $latestAssignment->id,
                ]),
            ]);
        }

        return back()->with('success', 'Dokumen berhasil diupload!');
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

        // Validate that this task allows client interaction (not 'read only')
        if ($task->client_interact === 'read only') {
            return back()->with('error', 'Task ini tidak memerlukan input dari client.');
        }

        $request->validate([
            'client_comment' => 'nullable|string|max:1000',
            'files' => 'nullable|array',
            'files.*' => 'nullable|file|mimes:pdf,doc,docx,xls,xlsx,jpg,jpeg,png|max:10240', // 10MB max
            'file_labels' => 'nullable|array',
            'file_labels.*' => 'nullable|string|max:255',
        ]);

        // Create new task assignment for client reply
        $assignment = \App\Models\TaskAssignment::create([
            'task_id' => $task->id,
            'task_name' => $task->name,
            'working_step_name' => $task->working_step_name,
            'project_name' => $task->project_name,
            'project_client_name' => $task->project_client_name,
            'time' => now(),
            'notes' => null, // Client doesn't use notes field
            'client_comment' => $request->client_comment,
            'comment' => null,
        ]);

        // Upload files
        if ($request->hasFile('files')) {
            $files = $request->file('files');
            $labels = $request->file_labels ?? [];

            foreach ($files as $index => $file) {
                $label = $labels[$index] ?? $file->getClientOriginalName();
                
                // Store the file
                $fileName = time() . '_' . $index . '_' . $file->getClientOriginalName();
                $filePath = $file->storeAs('documents', $fileName, 'public');
                
                // Create document record
                \App\Models\Document::create([
                    'task_assignment_id' => $assignment->id,
                    'name' => $label,
                    'slug' => \Illuminate\Support\Str::slug($label . '-' . time() . '-' . $index),
                    'file' => $filePath,
                    'uploaded_at' => now(),
                ]);
            }
        }

        // Update task status
        $task->update([
            'status' => 'Client Reply',
            'completion_status' => 'in_progress',
        ]);

        // Log activity
        \App\Models\ActivityLog::create([
            'user_id' => Auth::id(),
            'user_name' => Auth::user()->name,
            'action_type' => 'task',
            'action' => 'client_reply',
            'target_name' => $task->name,
            'description' => "Client submitted reply for task: {$task->name}",
            'meta' => json_encode([
                'task_id' => $task->id,
                'project_id' => $task->project_id,
                'assignment_id' => $assignment->id,
                'files_count' => count($request->file('files') ?? []),
            ]),
        ]);

        return back()->with('success', 'Balasan berhasil dikirim!');
    }
}
