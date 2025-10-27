<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;

use App\Models\WorkingSubStep;
use App\Models\WorkingStep;
use App\Models\Project;
use App\Models\User;
use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ProjectController extends Controller
{
    /**
     * Display list of all clients
     */
    public function index(Request $request)
    {
        $clients = Client::with('user')
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', '%' . $search . '%')
                    ->orWhereHas('user', function ($userQuery) use ($search) {
                        $userQuery->where('name', 'like', '%' . $search . '%')
                            ->orWhere('email', 'like', '%' . $search . '%');
                    });
            })
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Project/Index', [
            'clients' => $clients,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Display project data for specific client
     */
    public function show(Client $client)
    {
        // Load the user relationship
        $client->load('user');

        // Get project for the client first
        $project = Project::where('client_id', $client->id)->first();

        $hasProjectData = false;
        $projectData = collect();

        if ($project) {
            // Get working sub steps for this project with complete relationships
            $workingSubSteps = WorkingSubStep::with(['workingStep', 'documents'])
                ->where('project_id', $project->id)
                ->orderBy('working_step_id')
                ->orderBy('order')
                ->get();

            $hasProjectData = $workingSubSteps->isNotEmpty();

            if ($hasProjectData) {
                // Transform data to match frontend expectations
                $projectData = $workingSubSteps->map(function ($subStep) {
                    return [
                        'id' => $subStep->id,
                        'project_id' => $subStep->project_id,
                        'working_step_id' => $subStep->working_step_id,
                        'working_sub_step_id' => $subStep->id,
                        'time' => $subStep->time,
                        'comment' => $subStep->comment,
                        'client_comment' => $subStep->client_comment,
                        'client_interact' => $subStep->client_interact,
                        'multiple_files' => $subStep->multiple_files,
                        'status' => $subStep->status ?? 'Draft',
                        'created_at' => $subStep->created_at,
                        'updated_at' => $subStep->updated_at,
                        'working_step' => $subStep->workingStep ? [
                            'id' => $subStep->workingStep->id,
                            'name' => $subStep->workingStep->name,
                            'slug' => $subStep->workingStep->slug,
                        ] : null,
                        'working_sub_step' => [
                            'id' => $subStep->id,
                            'name' => $subStep->name,
                            'slug' => $subStep->slug,
                            'working_step_id' => $subStep->working_step_id,
                            'working_step' => $subStep->workingStep ? [
                                'id' => $subStep->workingStep->id,
                                'name' => $subStep->workingStep->name,
                                'slug' => $subStep->workingStep->slug,
                            ] : null,
                        ],
                        'documents' => $subStep->documents ? $subStep->documents->map(function ($doc) {
                            return [
                                'id' => $doc->id,
                                'name' => $doc->name,
                                'slug' => $doc->slug,
                                'working_sub_step_id' => $doc->working_sub_step_id,
                            ];
                        })->toArray() : [],
                    ];
                })->groupBy(function ($item) {
                    return $item['working_step']['name'] ?? 'Working Step Tidak Diketahui';
                });
            }
        }



        return Inertia::render('Admin/Project/Show', [
            'client' => $client,
            'project' => $projectData,
            'hasProjectData' => $hasProjectData,
        ]);
    }

    /**
     * Generate project data from templates for a client
     */
    public function generateFromProjectTemplate(Client $client)
    {
        // Load the user relationship
        $client->load('user');

        // Check if client already has a project
        $existingProject = Project::where('client_id', $client->id)->first();
        if ($existingProject) {
            // Check if project already has working sub steps
            $existingWorkingData = WorkingSubStep::where('project_id', $existingProject->id)->count();
            if ($existingWorkingData > 0) {
                return redirect()->route('admin.project.show', $client)
                    ->with('error', 'Klien ini sudah memiliki data project.');
            }
        } else {
            // Create new project for client if doesn't exist
            $existingProject = Project::create([
                'name' => "Project untuk {$client->name}",
                'client_id' => $client->id,
            ]);
        }

        // Get all template working sub steps and create working sub steps for client project
        $templateSubSteps = \App\Models\TemplateWorkingSubStep::with(['templateWorkingStep'])->get();

        if ($templateSubSteps->isEmpty()) {
            return redirect()->route('admin.project.show', $client)
                ->with('error', 'Tidak ada template sub step yang tersedia. Silakan buat template terlebih dahulu.');
        }

        $createdCount = 0;
        foreach ($templateSubSteps as $templateSubStep) {
            // Create or get working step for this project
            $workingStep = WorkingStep::firstOrCreate([
                'project_id' => $existingProject->id,
                'name' => $templateSubStep->templateWorkingStep?->name ?? 'Default Step',
                'slug' => \Illuminate\Support\Str::slug($templateSubStep->templateWorkingStep?->name ?? 'default-step'),
            ], [
                'order' => $templateSubStep->templateWorkingStep?->order ?? 0,
            ]);

            // Create working sub step
            WorkingSubStep::create([
                'order' => $templateSubStep->order ?? 0,
                'name' => $templateSubStep->name,
                'slug' => \Illuminate\Support\Str::slug($templateSubStep->name . '-' . $existingProject->id),
                'project_id' => $existingProject->id,
                'working_step_id' => $workingStep->id,
                'time' => $templateSubStep->time,
                'comment' => $templateSubStep->comment,
                'client_comment' => $templateSubStep->client_comment,
                'client_interact' => $templateSubStep->client_interact ?? false,
                'multiple_files' => $templateSubStep->multiple_files ?? false,
                'status' => 'Draft',
            ]);
            $createdCount++;
        }

        return redirect()->route('admin.project.show', $client)
            ->with('success', "Berhasil generate {$createdCount} data project dari template untuk klien {$client->name}.");
    }

    /**
     * Show edit form for specific working sub step data
     */
    public function edit(WorkingSubStep $projectKlien)
    {
        $projectKlien->load(['workingStep', 'documents', 'project.client.user']);

        return Inertia::render('Admin/Project/Edit', [
            'project' => $projectKlien,
        ]);
    }

    /**
     * Update specific working sub step data
     */
    public function update(Request $request, WorkingSubStep $projectKlien)
    {
        $request->validate([
            'time' => 'nullable|date',
            'comment' => 'nullable|string',
            'client_comment' => 'nullable|string',
            'client_interact' => 'nullable|boolean',
            'multiple_files' => 'nullable|boolean',
            'status' => 'required|in:Draft,Submitted,Under Review by Team Leader,Approved by Team Leader,Returned for Revision (by Team Leader),Under Review by Manager,Approved by Manager,Returned for Revision (by Manager),Under Review by Supervisor,Approved by Supervisor,Returned for Revision (by Supervisor),Under Review by Partner,Approved by Partner,Returned for Revision (by Partner),Submitted to Client,Client Reply',
        ]);

        $projectKlien->update([
            'time' => $request->time,
            'comment' => $request->comment,
            'client_comment' => $request->client_comment,
            'client_interact' => $request->client_interact ?? false,
            'multiple_files' => $request->multiple_files ?? false,
            'status' => $request->status,
        ]);

        return redirect()->route('admin.project.show', $projectKlien->project->client)
            ->with('success', 'Data project berhasil diupdate.');
    }

    /**
     * Show project management page (like template bundle edit)
     */
    public function manage(Client $client)
    {
        $project = Project::where('client_id', $client->id)->with('client.user')->first();

        if (!$project) {
            return redirect()->route('admin.project.index')
                ->with('error', 'Project not found for this client.');
        }

        // Get working steps with sub steps
        $workingSteps = WorkingStep::with('workingSubSteps')
            ->where('project_id', $project->id)
            ->orderBy('order')
            ->get();

        return Inertia::render('Admin/Project/ProjectManage', [
            'project' => $project,
            'workingSteps' => $workingSteps,
        ]);
    }

    /**
     * Reorder working steps
     */
    public function reorderWorkingSteps(Request $request)
    {
        try {
            $request->validate([
                'steps' => 'required|array',
                'steps.*.id' => 'required|exists:working_steps,id',
                'steps.*.order' => 'required|integer|min:1',
            ]);

            foreach ($request->steps as $stepData) {
                WorkingStep::where('id', $stepData['id'])
                    ->update(['order' => $stepData['order']]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Working steps reordered successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error reordering steps: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reorder working sub steps
     */
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
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error reordering substeps: ' . $e->getMessage()
            ], 500);
        }
    }
}
