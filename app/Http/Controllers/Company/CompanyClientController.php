<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CompanyClientController extends Controller
{
    /**
     * Display list of clients related to company user's projects.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        
        // Get filter parameters
        $search = $request->get('search');

        // Get client IDs from projects where the user is a team member
        $clientIds = DB::table('project_teams')
            ->join('projects', 'project_teams.project_id', '=', 'projects.id')
            ->where('project_teams.user_id', $user->id)
            ->whereNotNull('projects.client_id')
            ->distinct()
            ->pluck('projects.client_id');

        // Build query for clients
        $query = Client::whereIn('id', $clientIds)
            ->withCount(['projects' => function ($q) use ($user) {
                $q->whereHas('projectTeams', function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                });
            }]);

        // Apply search filter
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('alamat', 'like', "%{$search}%")
                  ->orWhere('kementrian', 'like', "%{$search}%");
            });
        }

        $clients = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('Company/Clients/Index', [
            'clients' => $clients,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    /**
     * Display client details with related projects.
     */
    public function show(Request $request, Client $client)
    {
        $user = Auth::user();

        // Check if user has access to this client (through projects)
        $hasAccess = DB::table('project_teams')
            ->join('projects', 'project_teams.project_id', '=', 'projects.id')
            ->where('project_teams.user_id', $user->id)
            ->where('projects.client_id', $client->id)
            ->exists();

        if (!$hasAccess) {
            abort(403, 'Unauthorized access to this client.');
        }

        // Get search and filter parameters
        $search = $request->get('search');
        $status = $request->get('status');

        // Get projects where user is a team member with pagination
        $projectsQuery = Project::where('client_id', $client->id)
            ->whereHas('projectTeams', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })
            ->withCount(['workingSteps', 'tasks']);

        // Apply search filter
        if ($search) {
            $projectsQuery->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        // Apply status filter
        if ($status && in_array($status, ['Draft', 'In Progress', 'Completed', 'Archived'])) {
            $projectsQuery->where('status', $status);
        }

        $projects = $projectsQuery->latest()->paginate(6)->withQueryString();

        return Inertia::render('Company/Clients/Show', [
            'client' => $client,
            'projects' => $projects,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
        ]);
    }
}
