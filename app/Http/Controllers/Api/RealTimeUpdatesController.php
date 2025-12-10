<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class RealTimeUpdatesController extends Controller
{
    /**
     * Get real-time updates for current user
     */
    public function getUpdates(Request $request)
    {
        try {
            $user = Auth::user();
            
            // Simple test response
            return response()->json([
                'hasUpdates' => true,
                'message' => 'Realtime API works!',
                'user' => $user ? $user->name : 'Guest',
                'timestamp' => Carbon::now(),
                'counts' => [
                    'pending_approvals' => 2,
                    'new_assignments' => 1,
                    'recent_activities' => 3
                ],
                'approvals' => [
                    [
                        'id' => 'test-1',
                        'name' => 'Test Task',
                        'project_name' => 'Test Project',
                        'urgency' => 'medium'
                    ]
                ],
                'assignments' => [],
                'activities' => []
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Real-time updates error: ' . $e->getMessage());
            
            return response()->json([
                'hasUpdates' => false,
                'error' => $e->getMessage(),
                'counts' => [
                    'pending_approvals' => 0,
                    'new_assignments' => 0,
                    'recent_activities' => 0
                ],
                'approvals' => [],
                'assignments' => [],
                'activities' => []
            ], 500);
        }
    }

    /**
     * Mark updates as seen
     */
    public function markAsSeen(Request $request)
    {
        return response()->json(['success' => true]);
    }

    /**
     * Get dashboard summary
     */
    public function getDashboardSummary(Request $request)
    {
        return response()->json([
            'summary' => [
                'total_projects' => 8,
                'pending_approvals' => 2,
                'ongoing_tasks' => 5,
                'completed_this_week' => 10,
                'urgent_tasks' => 1,
                'overdue_tasks' => 0
            ]
        ]);
    }
}
