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
        
        // Get client's projects
        $projects = Project::where('client_id', $user->client_id)
            ->withCount(['workingSteps', 'tasks'])
            ->with(['client'])
            ->latest()
            ->get();

        // Get task statistics
        $totalTasks = Task::whereHas('project', function ($query) use ($user) {
            $query->where('client_id', $user->client_id);
        })->count();

        $completedTasks = Task::whereHas('project', function ($query) use ($user) {
            $query->where('client_id', $user->client_id);
        })->where('status', 'completed')->count();

        $pendingTasks = Task::whereHas('project', function ($query) use ($user) {
            $query->where('client_id', $user->client_id);
        })->where('status', 'pending')->count();

        $inProgressTasks = Task::whereHas('project', function ($query) use ($user) {
            $query->where('client_id', $user->client_id);
        })->where('status', 'in_progress')->count();

        return Inertia::render('Client/Dashboard', [
            'projects' => $projects,
            'stats' => [
                'total_projects' => $projects->count(),
                'total_tasks' => $totalTasks,
                'completed_tasks' => $completedTasks,
                'pending_tasks' => $pendingTasks,
                'in_progress_tasks' => $inProgressTasks,
            ],
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
