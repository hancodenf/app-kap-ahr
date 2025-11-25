<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class SecurityUnlockMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Debug logging
        Log::info('SecurityUnlockMiddleware triggered', [
            'url' => $request->url(),
            'security_unlocked' => $request->session()->get('security_unlocked', false),
            'session_id' => $request->session()->getId(),
        ]);

        // Check if security features are unlocked in session
        if (!$request->session()->get('security_unlocked', false)) {
            // Logout user and redirect to login
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
            
            Log::warning('Security access denied - redirecting to login');
            
            return redirect()->route('login')->with('error', 'Unauthorized access to security monitoring.');
        }

        Log::info('Security access granted');
        return $next($request);
    }
}
