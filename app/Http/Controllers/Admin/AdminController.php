<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\User;
use App\Models\Project;
use App\Models\ProjectTemplate;
use App\Models\WorkingStep;
use App\Models\Task;
use App\Models\Document;
use Carbon\Carbon;

class AdminController extends Controller
{
    public function dashboard()
    {
        // Get user statistics
        $totalUsers = User::count();
        $newUsersThisMonth = User::whereMonth('created_at', Carbon::now()->month)->count();
        $usersByRole = User::get()->groupBy('role')->map->count();

        // Get audit statistics (using Project as audits)
        $totalAudits = Project::count();
        $auditsThisMonth = Project::whereMonth('created_at', Carbon::now()->month)->count();
        // Since status column doesn't exist, use 0 as default or calculate based on other criteria
        $completedAudits = 0; // Can be adjusted based on actual business logic
        $pendingAudits = $totalAudits; // Assume all are pending for now

        // Get template statistics
        $totalProjectTemplates = ProjectTemplate::count();
        $templatesByWorkingStep = ProjectTemplate::with('templateWorkingSteps')->get()->groupBy(function($template) {
            return $template->templateWorkingSteps->count() > 0 ? $template->templateWorkingSteps->first()->name : 'No Steps';
        })->map->count();

        // Get system statistics
        $totalWorkingSteps = WorkingStep::count();
        $totalTasks = Task::count();
        $totalDocuments = Document::count();

        // Recent activities
        $recentProjects = Project::with(['client'])
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        // Map projects to audits structure for frontend
        $recentAudits = $recentProjects->map(function($project) {
            return [
                'id' => $project->id,
                'working_step' => ['name' => $project->name ?? 'Unnamed Project'],
                'task' => ['name' => $project->client_name ?? 'No Client'],
                'status' => $project->status ?? 'closed',
                'created_at' => $project->created_at
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
                    'role' => [
                        'display_name' => ucfirst($user->role)
                    ],
                    'created_at' => $user->created_at
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
                    'description' => 'Administrator role with full system access'
                ]
            ],
            'statistics' => [
                'users' => [
                    'total' => $totalUsers,
                    'newThisMonth' => $newUsersThisMonth,
                    'byRole' => $usersByRole,
                ],
                'audits' => [
                    'total' => $totalAudits,
                    'thisMonth' => $auditsThisMonth,
                    'completed' => $completedAudits,
                    'pending' => $pendingAudits,
                ],
                'templates' => [
                    'total' => $totalProjectTemplates,
                    'byWorkingStep' => $templatesByWorkingStep,
                ],
                'system' => [
                    'working_steps' => $totalWorkingSteps,
                    'tasks' => $totalTasks,
                    'documents' => $totalDocuments,
                ],
            ],
            'recentActivities' => [
                'audits' => $recentAudits,
                'users' => $recentUsers,
            ],
        ]);
    }
}
