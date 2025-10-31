<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\Document;
use App\Models\Project;
use App\Models\ProjectTeam;
use App\Models\TaskWorker;
use App\Models\User;
use App\Models\WorkingStep;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ProjectController extends Controller
{
    // ==================== BUNDLE MANAGEMENT ====================
    
    public function index()
    {
        $projects = Project::orderBy('name')->get();

        return Inertia::render('Admin/Project/Index', [
            'bundles' => $projects,
        ]);
    }

    public function createBundle()
    {
        // Get all clients
        $clients = \App\Models\Client::with('user:id,name,email')
            ->orderBy('name')
            ->get(['id', 'user_id', 'name', 'alamat', 'kementrian']);

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
            'team_members' => 'nullable|array',
            'team_members.*.user_id' => 'required|exists:users,id',
            'team_members.*.role' => 'required|in:partner,manager,supervisor,team leader,member',
            'template_id' => 'nullable|exists:project_templates,id',
        ]);

        // Get client data
        $client = \App\Models\Client::with('user')->find($request->client_id);

        // Create project with denormalized client data
        $project = Project::create([
            'name' => $request->name,
            'client_id' => $request->client_id,
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

        foreach ($templateSteps as $templateStep) {
            // Create step for project in working_steps table
            $newStep = WorkingStep::create([
                'project_id' => $projectId,
                'name' => $templateStep->name,
                'slug' => $templateStep->slug . '-' . $projectId, // Make slug unique per project
                'order' => $templateStep->order,
                'project_name' => $project->name,
                'project_client_name' => $project->client_name,
            ]);

            // Copy tasks from template_tasks to tasks
            foreach ($templateStep->templateTasks as $templateTask) {
                Task::create([
                    'project_id' => $projectId,
                    'working_step_id' => $newStep->id,
                    'name' => $templateTask->name,
                    'slug' => $templateTask->slug . '-' . $projectId, // Make slug unique per project
                    'order' => $templateTask->order,
                    'client_interact' => $templateTask->client_interact,
                    'multiple_files' => $templateTask->multiple_files,
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
                $query->with('taskWorkers')->orderBy('order');
            }])
            ->orderBy('order')
            ->get();

        // Get team members with their assigned tasks
        $teamMembers = ProjectTeam::where('project_id', $bundle->id)
            ->with('taskWorkers')
            ->orderBy('role')
            ->orderBy('user_name')
            ->get();

        return Inertia::render('Admin/Project/Show', [
            'bundle' => $bundle,
            'workingSteps' => $workingSteps,
            'teamMembers' => $teamMembers,
        ]);
    }

    public function editBundle(Project $bundle)
    {
        // Get working steps for this project
        $workingSteps = WorkingStep::where('project_id', $bundle->id)
            ->with(['tasks' => function($query) {
                $query->with('taskWorkers')->orderBy('order');
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

        // Get clients with user relation for emails
        $clients = Client::with('user')->orderBy('name')->get();

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
            'status' => 'required|in:open,closed',
        ]);

        // Get client with user relation for denormalized data
        $client = Client::with('user')->findOrFail($request->client_id);

        // Update project with denormalized client data
        $bundle->update([
            'name' => $request->name,
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

        // Update denormalized client data in documents (via tasks)
        Document::whereHas('task', function($query) use ($bundle) {
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
            'client_interact' => false,
            'multiple_files' => false,
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
            'client_interact' => 'boolean',
            'multiple_files' => 'boolean',
            'worker_ids' => 'nullable|array',
            'worker_ids.*' => 'exists:project_teams,id',
        ]);

        // Generate new slug if name changed
        $updateData = [
            'name' => $request->name,
            'client_interact' => $request->boolean('client_interact'),
            'multiple_files' => $request->boolean('multiple_files'),
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
}
