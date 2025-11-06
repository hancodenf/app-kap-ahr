<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        if (!Auth::check()) {
            return redirect('/login');
        }

        $user = Auth::user();
        
        if (!$user->role) {
            abort(403, 'Access denied. No role assigned.');
        }

        // Normalize role - treat 'client' and 'klien' as the same
        $userRole = $user->role;
        if ($userRole === 'client') {
            $userRole = 'klien';
        }

        // Also normalize the allowed roles
        $normalizedRoles = array_map(function($role) {
            return $role === 'client' ? 'klien' : $role;
        }, $roles);

        // Check if user's role is in the allowed roles array
        if (!in_array($userRole, $normalizedRoles)) {
            abort(403, 'Access denied. Insufficient permissions.');
        }

        return $next($request);
    }
}
