<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\ProjectTeam;
use App\Models\Task;
use Illuminate\Support\Facades\Log;

class CanManageTaskAssignments
{
    /**
     * Handle an incoming request.
     * Check if user has team leader role or above in the project where the task belongs
     */
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();
        
        // Get task from route parameter (route model binding)
        $task = $request->route('task');
        
        // Debug logging
        Log::info('CanManageTaskAssignments middleware debug', [
            'user_id' => $user?->id,
            'task' => $task,
            'task_type' => gettype($task),
            'task_class' => is_object($task) ? get_class($task) : 'not_object'
        ]);
        
        if (!$task || !($task instanceof Task)) {
            return response()->json(['error' => 'Task not found'], 404);
        }
        
        // Check if user is a team member in this project with appropriate role
        $userRole = ProjectTeam::where('project_id', $task->project_id)
            ->where('user_id', $user->id)
            ->value('role');
            
        if (!$userRole) {
            return response()->json(['error' => 'You are not a member of this project'], 403);
        }
        
        // Define role hierarchy - roles that can manage task assignments
        $allowedRoles = ['partner', 'manager', 'supervisor', 'team leader'];
        
        if (!in_array($userRole, $allowedRoles)) {
            return response()->json(['error' => 'You do not have permission to manage task assignments'], 403);
        }
        
        return $next($request);
    }
}
