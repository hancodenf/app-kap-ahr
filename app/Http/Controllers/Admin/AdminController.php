<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Models\User;
use App\Models\Client;
use App\Models\Project;
use App\Models\ProjectTeam;
use App\Models\ProjectTemplate;
use App\Models\WorkingStep;
use App\Models\Task;
use App\Models\Document;
use App\Models\ActivityLog;
use App\Models\RegisteredAp;
use App\Models\News;
use Carbon\Carbon;

class AdminController extends Controller
{
    public function dashboard()
    {
        // =============================================
        // 1. USER STATISTICS
        // =============================================
        $totalUsers = User::count();
        $newUsersThisMonth = User::whereMonth('created_at', Carbon::now()->month)
            ->whereYear('created_at', Carbon::now()->year)
            ->count();
        
        $usersByRole = [
            'admin' => User::where('role', 'admin')->count(),
            'company' => User::where('role', 'company')->count(),
            'client' => User::where('role', 'client')->count(),
        ];

        // User growth trend (last 6 months)
        $userGrowth = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i);
            $userGrowth[] = [
                'month' => $month->format('M Y'),
                'count' => User::whereYear('created_at', $month->year)
                    ->whereMonth('created_at', $month->month)
                    ->count()
            ];
        }

        // =============================================
        // 2. CLIENT STATISTICS
        // =============================================
        $totalClients = Client::count();
        $newClientsThisMonth = Client::whereMonth('created_at', Carbon::now()->month)
            ->whereYear('created_at', Carbon::now()->year)
            ->count();

        // =============================================
        // 3. PROJECT STATISTICS
        // =============================================
        $totalProjects = Project::count();
        $activeProjects = Project::where('status', 'open')->count();
        $closedProjects = Project::where('status', 'closed')->count();
        $newProjectsThisMonth = Project::whereMonth('created_at', Carbon::now()->month)
            ->whereYear('created_at', Carbon::now()->year)
            ->count();

        // Project status distribution
        $projectsByStatus = [
            'open' => $activeProjects,
            'closed' => $closedProjects,
        ];

        // =============================================
        // 4. TASK STATISTICS
        // =============================================
        $totalTasks = Task::count();
        $tasksByStatus = [
            'pending' => Task::where('completion_status', 'pending')->count(),
            'in_progress' => Task::where('completion_status', 'in_progress')->count(),
            'completed' => Task::where('completion_status', 'completed')->count(),
        ];

        // Task assignment status (dari task_assignments, bukan tasks)
        // Ambil latest assignment untuk setiap task dan group by status
        $tasksByApprovalStatus = DB::table('task_assignments')
            ->select('status', DB::raw('count(DISTINCT task_id) as count'))
            ->whereNotNull('status')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        // =============================================
        // 5. TEMPLATE & SYSTEM STATISTICS
        // =============================================
        $totalTemplates = ProjectTemplate::count();
        $totalWorkingSteps = WorkingStep::count();
        $totalDocuments = Document::count();
        $totalRegisteredAPs = RegisteredAp::count();
        
        $activeAPs = RegisteredAp::where('status', 'active')->count();
        $expiredAPs = RegisteredAp::where('status', 'expired')->count();

        // =============================================
        // 6. TEAM STATISTICS
        // =============================================
        $totalTeamMembers = ProjectTeam::count();
        $teamsByRole = ProjectTeam::select('role', DB::raw('count(*) as count'))
            ->groupBy('role')
            ->pluck('count', 'role')
            ->toArray();

        // =============================================
        // 7. ACTIVITY STATISTICS
        // =============================================
        $totalActivities = ActivityLog::count();
        $activitiesToday = ActivityLog::whereDate('created_at', Carbon::today())->count();
        $activitiesThisWeek = ActivityLog::whereBetween('created_at', [
            Carbon::now()->startOfWeek(),
            Carbon::now()->endOfWeek()
        ])->count();

        // Activity trend (last 7 days)
        $activityTrend = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            $activityTrend[] = [
                'date' => $date->format('D'),
                'count' => ActivityLog::whereDate('created_at', $date)->count()
            ];
        }

        // Activities by type
        $activitiesByType = ActivityLog::select('action_type', DB::raw('count(*) as count'))
            ->groupBy('action_type')
            ->pluck('count', 'action_type')
            ->toArray();

        // =============================================
        // 8. RECENT ACTIVITIES
        // =============================================
        $recentActivities = ActivityLog::with('user')
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get()
            ->map(function($log) {
                return [
                    'id' => $log->id,
                    'user_name' => $log->user_name ?? 'System',
                    'action_type' => $log->action_type,
                    'action' => $log->action,
                    'target_name' => $log->target_name,
                    'description' => $log->description,
                    'created_at' => $log->created_at,
                ];
            });

        // =============================================
        // 9. RECENT ENTITIES
        // =============================================
        $recentProjects = Project::orderBy('created_at', 'desc')
            ->take(5)
            ->get()
            ->map(function($project) {
                return [
                    'id' => $project->id,
                    'name' => $project->name,
                    'client_name' => $project->client_name,
                    'status' => $project->status,
                    'created_at' => $project->created_at,
                ];
            });

        $recentUsers = User::orderBy('created_at', 'desc')
            ->take(5)
            ->get()
            ->map(function($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => ucfirst($user->role),
                    'created_at' => $user->created_at,
                ];
            });

        // =============================================
        // 10. TOP PERFORMERS
        // =============================================
        // Most active users (by activity logs)
        $topActiveUsers = ActivityLog::select('user_id', 'user_name', DB::raw('count(*) as activity_count'))
            ->whereNotNull('user_id')
            ->groupBy('user_id', 'user_name')
            ->orderByDesc('activity_count')
            ->take(5)
            ->get()
            ->map(function($log) {
                return [
                    'user_id' => $log->user_id,
                    'user_name' => $log->user_name,
                    'activity_count' => $log->activity_count,
                ];
            });

        // Most active projects (by task count)
        $topActiveProjects = Project::withCount('tasks')
            ->orderByDesc('tasks_count')
            ->take(5)
            ->get()
            ->map(function($project) {
                return [
                    'id' => $project->id,
                    'name' => $project->name,
                    'client_name' => $project->client_name,
                    'tasks_count' => $project->tasks_count,
                    'status' => $project->status,
                ];
            });

        // =============================================
        // 11. ADVANCED ANALYTICS
        // =============================================
        
        // Projects by Year (untuk chart)
        $projectsByYear = Project::select('year', DB::raw('count(*) as count'))
            ->groupBy('year')
            ->orderBy('year', 'desc')
            ->get()
            ->map(function($item) {
                return [
                    'year' => $item->year,
                    'count' => $item->count,
                ];
            });

        // Top Team Members by Project Count (user yang paling banyak handle projects)
        $topTeamMembers = ProjectTeam::select('user_id', 'user_name', 'user_position', DB::raw('count(DISTINCT project_id) as project_count'))
            ->whereNotNull('user_id')
            ->groupBy('user_id', 'user_name', 'user_position')
            ->orderByDesc('project_count')
            ->take(10)
            ->get()
            ->map(function($member) {
                return [
                    'user_id' => $member->user_id,
                    'user_name' => $member->user_name,
                    'user_position' => $member->user_position ?? 'N/A',
                    'project_count' => $member->project_count,
                ];
            });

        // Team Role Distribution in Projects
        $teamRoleDistribution = ProjectTeam::select('role', DB::raw('count(*) as count'))
            ->groupBy('role')
            ->orderByDesc('count')
            ->get()
            ->map(function($item) {
                return [
                    'role' => ucfirst(str_replace('_', ' ', $item->role)),
                    'count' => $item->count,
                ];
            });

        // Projects by Client (top 10 clients with most projects)
        $projectsByClient = Project::select('client_name', DB::raw('count(*) as project_count'))
            ->groupBy('client_name')
            ->orderByDesc('project_count')
            ->take(10)
            ->get()
            ->map(function($item) {
                return [
                    'client_name' => $item->client_name,
                    'project_count' => $item->project_count,
                ];
            });

        // Project Status by Year
        $projectStatusByYear = Project::select('year', 'status', DB::raw('count(*) as count'))
            ->groupBy('year', 'status')
            ->orderBy('year', 'desc')
            ->get()
            ->groupBy('year')
            ->map(function($yearProjects, $year) {
                return [
                    'year' => $year,
                    'open' => $yearProjects->where('status', 'open')->sum('count'),
                    'closed' => $yearProjects->where('status', 'closed')->sum('count'),
                ];
            })
            ->values();

        // Monthly Project Creation Trend (last 12 months)
        $projectCreationTrend = [];
        for ($i = 11; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i);
            $projectCreationTrend[] = [
                'month' => $month->format('M Y'),
                'count' => Project::whereYear('created_at', $month->year)
                    ->whereMonth('created_at', $month->month)
                    ->count()
            ];
        }

        // Task completion by working step (to see which steps have most completed tasks)
        $taskCompletionByStep = Task::select('working_step_name', 
                DB::raw('count(*) as total_tasks'),
                DB::raw('SUM(CASE WHEN completion_status = "completed" THEN 1 ELSE 0 END) as completed_tasks')
            )
            ->whereNotNull('working_step_name')
            ->groupBy('working_step_name')
            ->orderByDesc('total_tasks')
            ->take(10)
            ->get()
            ->map(function($item) {
                return [
                    'step_name' => $item->working_step_name,
                    'total_tasks' => $item->total_tasks,
                    'completed_tasks' => $item->completed_tasks,
                    'completion_rate' => $item->total_tasks > 0 ? round(($item->completed_tasks / $item->total_tasks) * 100, 1) : 0,
                ];
            });

        // =============================================
        // LATEST NEWS
        // =============================================
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
                    'creator' => ['name' => $news->creator->name],
                ];
            });

        return Inertia::render('Admin/Dashboard', [
            'user' => [
                'id' => Auth::user()->id,
                'name' => Auth::user()->name,
                'email' => Auth::user()->email,
                'role' => [
                    'name' => Auth::user()->role,
                    'display_name' => ucfirst(Auth::user()->role),
                    'description' => 'Full system access and management capabilities'
                ]
            ],
            'statistics' => [
                'users' => [
                    'total' => $totalUsers,
                    'newThisMonth' => $newUsersThisMonth,
                    'byRole' => $usersByRole,
                    'growth' => $userGrowth,
                ],
                'clients' => [
                    'total' => $totalClients,
                    'newThisMonth' => $newClientsThisMonth,
                ],
                'projects' => [
                    'total' => $totalProjects,
                    'active' => $activeProjects,
                    'closed' => $closedProjects,
                    'newThisMonth' => $newProjectsThisMonth,
                    'byStatus' => $projectsByStatus,
                ],
                'tasks' => [
                    'total' => $totalTasks,
                    'byStatus' => $tasksByStatus,
                    'byApprovalStatus' => $tasksByApprovalStatus,
                ],
                'templates' => [
                    'total' => $totalTemplates,
                ],
                'system' => [
                    'working_steps' => $totalWorkingSteps,
                    'documents' => $totalDocuments,
                    'registered_aps' => $totalRegisteredAPs,
                    'active_aps' => $activeAPs,
                    'expired_aps' => $expiredAPs,
                ],
                'team' => [
                    'total' => $totalTeamMembers,
                    'byRole' => $teamsByRole,
                ],
                'activities' => [
                    'total' => $totalActivities,
                    'today' => $activitiesToday,
                    'thisWeek' => $activitiesThisWeek,
                    'trend' => $activityTrend,
                    'byType' => $activitiesByType,
                ],
            ],
            'recentActivities' => $recentActivities,
            'recentProjects' => $recentProjects,
            'recentUsers' => $recentUsers,
            'topActiveUsers' => $topActiveUsers,
            'topActiveProjects' => $topActiveProjects,
            'latestNews' => $latestNews,
            // Advanced Analytics
            'analytics' => [
                'projectsByYear' => $projectsByYear,
                'topTeamMembers' => $topTeamMembers,
                'teamRoleDistribution' => $teamRoleDistribution,
                'projectsByClient' => $projectsByClient,
                'projectStatusByYear' => $projectStatusByYear,
                'projectCreationTrend' => $projectCreationTrend,
                'taskCompletionByStep' => $taskCompletionByStep,
            ],
        ]);
    }
}
