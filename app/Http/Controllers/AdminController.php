<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\User;
use App\Models\AuditKlien;
use App\Models\Template;
use App\Models\Level;
use App\Models\SubLevel;
use App\Models\Document;
use Carbon\Carbon;

class AdminController extends Controller
{
    public function dashboard()
    {
        // Get user statistics
        $totalUsers = User::count();
        $newUsersThisMonth = User::whereMonth('created_at', Carbon::now()->month)->count();
        $usersByRole = User::with('role')->get()->groupBy('role.name')->map->count();

        // Get audit statistics
        $totalAudits = AuditKlien::count();
        $auditsThisMonth = AuditKlien::whereMonth('created_at', Carbon::now()->month)->count();
        $auditsCompleted = AuditKlien::whereNotNull('acc_partner')->whereNotNull('acc_klien')->count();
        $auditsPending = $totalAudits - $auditsCompleted;

        // Get template statistics
        $totalTemplates = Template::count();
        $templatesByLevel = Template::with('level')->get()->groupBy('level.name')->map->count();

        // Get system statistics
        $totalLevels = Level::count();
        $totalSubLevels = SubLevel::count();
        $totalDocuments = Document::count();

        // Recent activities
        $recentAudits = AuditKlien::with(['level', 'subLevel', 'document'])
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        $recentUsers = User::with('role')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        return Inertia::render('Admin/Dashboard', [
            'user' => Auth::user()->load('role'),
            'statistics' => [
                'users' => [
                    'total' => $totalUsers,
                    'newThisMonth' => $newUsersThisMonth,
                    'byRole' => $usersByRole,
                ],
                'audits' => [
                    'total' => $totalAudits,
                    'thisMonth' => $auditsThisMonth,
                    'completed' => $auditsCompleted,
                    'pending' => $auditsPending,
                ],
                'templates' => [
                    'total' => $totalTemplates,
                    'byLevel' => $templatesByLevel,
                ],
                'system' => [
                    'levels' => $totalLevels,
                    'subLevels' => $totalSubLevels,
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
