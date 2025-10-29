<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\Document;
use App\Models\Project;
use App\Models\ProjectTeam;
use App\Models\SubStepWorker;
use App\Models\User;
use App\Models\WorkingStep;
use App\Models\WorkingSubStep;
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
            ->with('success', 'Project berhasil dibuat!');
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
            ->with('templateWorkingSubSteps')
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

            // Copy sub steps from template_working_sub_steps to working_sub_steps
            foreach ($templateStep->templateWorkingSubSteps as $templateSubStep) {
                WorkingSubStep::create([
                    'project_id' => $projectId,
                    'working_step_id' => $newStep->id,
                    'name' => $templateSubStep->name,
                    'slug' => $templateSubStep->slug . '-' . $projectId, // Make slug unique per project
                    'order' => $templateSubStep->order,
                    'client_interact' => $templateSubStep->client_interact,
                    'multiple_files' => $templateSubStep->multiple_files,
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
            ->with(['workingSubSteps' => function($query) {
                $query->with('subStepWorkers')->orderBy('order');
            }])
            ->orderBy('order')
            ->get();

        // Get team members with their assigned sub steps
        $teamMembers = ProjectTeam::where('project_id', $bundle->id)
            ->with('subStepWorkers')
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
            ->with(['workingSubSteps' => function($query) {
                $query->with('subStepWorkers')->orderBy('order');
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
        ]);

        // Get client with user relation for denormalized data
        $client = Client::with('user')->findOrFail($request->client_id);

        // Update project with denormalized client data
        $bundle->update([
            'name' => $request->name,
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

        // Update denormalized client data in working_sub_steps
        WorkingSubStep::where('project_id', $bundle->id)->update([
            'project_client_name' => $client->name,
        ]);

        // Update denormalized client data in sub_step_workers
        SubStepWorker::whereHas('workingSubStep', function($query) use ($bundle) {
            $query->where('project_id', $bundle->id);
        })->update([
            'project_client_name' => $client->name,
        ]);

        // Update denormalized client data in documents (via working_sub_steps)
        Document::whereHas('workingSubStep', function($query) use ($bundle) {
            $query->where('project_id', $bundle->id);
        })->update([
            'project_client_name' => $client->name,
        ]);

        return redirect()->route('admin.projects.bundles.edit', $bundle->id)
            ->with('success', 'Project berhasil diupdate!');
    }

    public function destroyBundle(Project $bundle)
    {
        // Check if project has working steps
        if ($bundle->workingSteps()->exists()) {
            return redirect()->route('admin.projects.bundles.index')
                ->with('error', 'Tidak dapat menghapus project yang masih memiliki working steps!');
        }

        $bundle->delete();

        return redirect()->route('admin.projects.bundles.index')
            ->with('success', 'Project berhasil dihapus!');
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
                return redirect()->back()->with('error', 'Project ID tidak valid. Parameter: ' . json_encode($request->all()));
            }

            // Get project for denormalized data
            $project = Project::find($projectId);

            // Get next order number for this project
            $nextOrder = WorkingStep::where('project_id', $projectId)
                ->max('order') + 1;

            // Create working step (slug will be auto-generated by Model)
            $workingStep = WorkingStep::create([
                'name' => $request->name,
                'project_id' => $projectId,
                'order' => $nextOrder,
                'project_name' => $project->name,
                'project_client_name' => $project->client_name,
            ]);

            return redirect()->back()->with('success', 'Working Step berhasil dibuat!');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal membuat working step: ' . $e->getMessage());
        }
    }

    public function updateWorkingStep(Request $request, WorkingStep $workingStep)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        // Update name (slug will be auto-updated by Model if name changed)
        $workingStep->update([
            'name' => $request->name,
        ]);

        return redirect()->back()->with('success', 'Working Step berhasil diupdate!');
    }

    public function destroyWorkingStep(WorkingStep $workingStep)
    {
        // Delete all related sub steps
        $workingStep->workingSubSteps()->delete();
        
        // Delete the working step
        $workingStep->delete();

        return redirect()->back()->with('success', 'Working Step dan sub steps berhasil dihapus!');
    }

    // ==================== WORKING SUB STEP MANAGEMENT ====================

    public function storeWorkingSubStep(Request $request)
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
        $nextOrder = WorkingSubStep::where('working_step_id', $request->working_step_id)
            ->max('order') + 1;

        // Create sub step (slug will be auto-generated by Model)
        $subStep = WorkingSubStep::create([
            'name' => $request->name,
            'working_step_id' => $request->working_step_id,
            'project_id' => $workingStep->project_id,
            'order' => $nextOrder,
            'client_interact' => false,
            'multiple_files' => false,
            'project_name' => $project->name,
            'project_client_name' => $project->client_name,
            'working_step_name' => $workingStep->name,
        ]);

        return redirect()->back()->with('success', 'Working Sub Step berhasil dibuat!');
    }

    public function updateWorkingSubStep(Request $request, WorkingSubStep $workingSubStep)
    {
        \Log::info('Update SubStep Request', [
            'data' => $request->all(),
            'substep_id' => $workingSubStep->id
        ]);

        $request->validate([
            'name' => 'required|string|max:255',
            'client_interact' => 'boolean',
            'multiple_files' => 'boolean',
            'worker_ids' => 'nullable|array',
            'worker_ids.*' => 'exists:project_teams,id',
        ]);

        $workingSubStep->update([
            'name' => $request->name,
            'client_interact' => $request->boolean('client_interact'),
            'multiple_files' => $request->boolean('multiple_files'),
        ]);

        // Refresh model to get updated data
        $workingSubStep->refresh();

        // Sync workers - Delete old ones and create new ones
        if ($request->has('worker_ids')) {
            // Delete existing workers for this sub step
            $workingSubStep->subStepWorkers()->delete();

            // Create new workers with denormalized data
            if (!empty($request->worker_ids)) {
                foreach ($request->worker_ids as $projectTeamId) {
                    $projectTeam = ProjectTeam::find($projectTeamId);
                    
                    if ($projectTeam) {
                        SubStepWorker::create([
                            'working_sub_step_id' => $workingSubStep->id,
                            'project_team_id' => $projectTeam->id,
                            'working_sub_step_name' => $workingSubStep->name,
                            'working_step_name' => $workingSubStep->working_step_name,
                            'project_name' => $workingSubStep->project_name,
                            'project_client_name' => $workingSubStep->project_client_name,
                            'worker_name' => $projectTeam->user_name,
                            'worker_email' => $projectTeam->user_email,
                            'worker_role' => $projectTeam->role,
                        ]);
                    }
                }
            }
        }

        return redirect()->back()->with('success', 'Working Sub Step berhasil diupdate!');
    }

    public function destroyWorkingSubStep(WorkingSubStep $workingSubStep)
    {
        $workingSubStep->delete();

        return redirect()->back()->with('success', 'Working Sub Step berhasil dihapus!');
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

    public function reorderWorkingSubSteps(Request $request)
    {
        try {
            $request->validate([
                'sub_steps' => 'required|array',
                'sub_steps.*.id' => 'required|exists:working_sub_steps,id',
                'sub_steps.*.order' => 'required|integer|min:1',
                'sub_steps.*.working_step_id' => 'required|exists:working_steps,id',
            ]);

            foreach ($request->sub_steps as $subStepData) {
                WorkingSubStep::where('id', $subStepData['id'])
                    ->update([
                        'order' => $subStepData['order'],
                        'working_step_id' => $subStepData['working_step_id']
                    ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Working sub steps reordered successfully'
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
                'message' => 'Error reordering substeps: ' . $e->getMessage()
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

        return redirect()->back()->with('success', 'Project berhasil diupdate!');
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
            return redirect()->back()->with('error', 'User sudah ada dalam tim project ini!');
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

        return redirect()->back()->with('success', 'Anggota tim berhasil ditambahkan!');
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

        return redirect()->back()->with('success', 'Role anggota tim berhasil diupdate!');
    }

    public function destroyTeamMember($teamId)
    {
        $teamMember = ProjectTeam::findOrFail($teamId);
        $teamMember->delete();

        return redirect()->back()->with('success', 'Anggota tim berhasil dihapus!');
    }
}
