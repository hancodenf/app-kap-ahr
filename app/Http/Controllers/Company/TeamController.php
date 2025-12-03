<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\ProjectTeam;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TeamController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $position = $request->input('position');

        // Get company users only
        $query = User::where('role', 'company')
            ->where('is_active', true);

        // Apply search filter
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Apply position filter
        if ($position) {
            $query->where('position', $position);
        }

        // Get users with project count
        $users = $query->withCount('projectTeams')
            ->orderBy('position')
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        // Transform data to match frontend expectations
        $users->getCollection()->transform(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'profile_photo' => $user->profile_photo ?? null,
                'position' => $user->position ?? null,
                'whatsapp' => $user->whatsapp ?? null,
                'is_active' => $user->is_active,
                'role' => [
                    'id' => null,
                    'name' => $user->role,
                    'display_name' => ucfirst($user->role),
                ],
                'created_at' => $user->created_at,
                'project_teams_count' => $user->project_teams_count ?? 0,
            ];
        });

        // Get position counts
        $positionCounts = User::where('role', 'company')
            ->where('is_active', true)
            ->whereNotNull('position')
            ->selectRaw('position, COUNT(*) as count')
            ->groupBy('position')
            ->pluck('count', 'position')
            ->toArray();

        return Inertia::render('Company/Teams/Index', [
            'users' => $users,
            'filters' => [
                'search' => $search,
                'position' => $position,
            ],
            'positionCounts' => $positionCounts,
        ]);
    }

    public function show(Request $request, User $user)
    {
        // Get paginated project teams
        $projectTeams = ProjectTeam::where('user_id', $user->id)
            ->with(['project' => function ($q) {
                $q->with('client:id,name');
            }])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        // Transform the paginated data
        $projectTeams->getCollection()->transform(function ($projectTeam) {
            return [
                'id' => $projectTeam->id,
                'project_id' => $projectTeam->project_id,
                'project_name' => $projectTeam->project->name ?? 'N/A',
                'project_client_name' => $projectTeam->project->client->name ?? 'N/A',
                'project_status' => $projectTeam->project->status ?? 'N/A',
                'role' => $projectTeam->role,
                'user_position' => $projectTeam->user_position,
                'created_at' => $projectTeam->created_at,
            ];
        });

        // Build user data structure
        $userData = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'profile_photo' => $user->profile_photo ?? null,
            'email_verified_at' => $user->email_verified_at,
            'role' => [
                'id' => null,
                'name' => $user->role,
                'display_name' => ucfirst($user->role),
            ],
            'position' => $user->position ?? null,
            'user_type' => $user->user_type ?? null,
            'whatsapp' => $user->whatsapp ?? null,
            'is_active' => $user->is_active,
            'created_at' => $user->created_at,
            'updated_at' => $user->updated_at,
            'project_teams_count' => ProjectTeam::where('user_id', $user->id)->count(),
        ];

        return Inertia::render('Company/Teams/Show', [
            'user' => $userData,
            'projectTeams' => $projectTeams,
        ]);
    }
}
