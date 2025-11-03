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
    /**
     * Company Dashboard
     */
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
                $query->with(['taskWorkers.projectTeam'])->orderBy('order');
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
                            'time' => $task->time,
                            'comment' => $task->comment,
                            'client_comment' => $task->client_comment,
                            'is_assigned_to_me' => $myAssignment !== null,
                            'my_assignment_id' => $myAssignment ? $myAssignment->id : null,
                            'documents' => $task->documents->map(function($doc) {
                                return [
                                    'id' => $doc->id,
                                    'name' => $doc->name,
                                    'file' => $doc->file,
                                    'uploaded_at' => $doc->uploaded_at,
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
        
        $request->validate([
            'comment' => 'nullable|string',
            'time' => 'nullable|string',
            'files.*' => 'nullable|file|max:10240', // Max 10MB per file
        ]);
        
        // Update comment and time if provided
        if ($request->has('comment')) {
            $task->comment = $request->comment;
        }
        if ($request->has('time')) {
            $task->time = $request->time;
        }
        
        // Handle file uploads
        if ($request->hasFile('files')) {
            $project = $task->workingStep->project;
            
            foreach ($request->file('files') as $file) {
                $originalName = $file->getClientOriginalName();
                $filename = time() . '_' . uniqid() . '_' . $originalName;
                
                // Store in storage/app/public/task-files
                $path = $file->storeAs('task-files', $filename, 'public');
                
                // Create document record
                \App\Models\Document::create([
                    'task_id' => $task->id,
                    'task_name' => $task->name,
                    'working_step_name' => $task->workingStep->name ?? 'N/A',
                    'project_name' => $project->name,
                    'project_client_name' => $project->client->name ?? 'N/A',
                    'name' => $originalName,
                    'slug' => \Illuminate\Support\Str::slug($originalName . '-' . time()),
                    'file' => $path,
                    'uploaded_at' => now(),
                ]);
            }
        }
        
        $task->save();
        
        return back()->with('success', 'Task updated successfully!');
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
