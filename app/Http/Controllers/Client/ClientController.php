<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ClientController extends Controller
{
    /**
     * Display client dashboard.
     */
    public function dashboard()
    {
        $user = Auth::user();
        
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
        
        // 5. Tasks Requiring Client Action (client_interact = true, status = 'Submitted to Client')
        $tasksRequiringAction = $projectIds->isNotEmpty()
            ? Task::whereIn('project_id', $projectIds)
                ->where('client_interact', true)
                ->where('status', 'Submitted to Client')
                ->where('completion_status', '!=', 'completed')
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get()
                ->map(function($task) {
                    return [
                        'id' => $task->id,
                        'name' => $task->name,
                        'project_name' => $task->project_name,
                        'working_step_name' => $task->working_step_name,
                        'status' => $task->status,
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
            ->with(['client']);

        // Apply search filter
        if ($search) {
            $query->where('name', 'like', "%{$search}%");
        }

        $projects = $query->latest()->paginate(10)->withQueryString();

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

        $project->load([
            'client',
            'workingSteps' => function ($query) {
                $query->orderBy('order');
            },
            'workingSteps.tasks' => function ($query) {
                $query->orderBy('order');
            },
            'workingSteps.tasks.assignedUsers',
            'teamMembers.user',
        ]);

        return Inertia::render('Client/Projects/Show', [
            'project' => $project,
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

        $task->load([
            'workingStep',
            'project',
            'assignedUsers',
            'files',
        ]);

        return Inertia::render('Client/Tasks/View', [
            'task' => $task,
        ]);
    }
}
