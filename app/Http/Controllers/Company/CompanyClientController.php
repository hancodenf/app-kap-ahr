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
        // Exclude draft and archived projects for company level
        $clientIds = DB::table('project_teams')
            ->join('projects', 'project_teams.project_id', '=', 'projects.id')
            ->where('project_teams.user_id', $user->id)
            ->whereNotNull('projects.client_id')
            ->whereNotIn('projects.status', ['Draft'])
            ->where('projects.is_archived', false)
            ->distinct()
            ->pluck('projects.client_id');

        // Build query for clients
        $query = Client::whereIn('id', $clientIds)
            ->withCount(['projects' => function ($q) use ($user) {
                $q->whereHas('projectTeams', function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                })
                ->whereNotIn('status', ['Draft'])
                ->where('is_archived', false);
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
        // Exclude draft and archived projects for company level
        $hasAccess = DB::table('project_teams')
            ->join('projects', 'project_teams.project_id', '=', 'projects.id')
            ->where('project_teams.user_id', $user->id)
            ->where('projects.client_id', $client->id)
            ->whereNotIn('projects.status', ['Draft'])
            ->where('projects.is_archived', false)
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

        // Apply status filter - Company level hanya bisa melihat status: In Progress, Completed, Suspended, Canceled  
        // Draft dan Archived tidak ditampilkan untuk level company
        if ($status && in_array($status, ['In Progress', 'Completed', 'Suspended', 'Canceled'])) {
            $projectsQuery->where('status', $status);
        }

        // Filter out Draft and Archived projects for company users
        $projectsQuery->whereNotIn('status', ['Draft'])
                     ->where('is_archived', false);

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
