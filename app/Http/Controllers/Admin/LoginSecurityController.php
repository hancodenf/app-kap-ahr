<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\FailedLoginAttempt;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LoginSecurityController extends Controller
{
    /**
     * Display a listing of failed login attempts.
     */
    public function index(Request $request)
    {
        $search = $request->input('search', '');
        $filter = $request->input('filter', 'all'); // all, suspended, recent
        $startDate = $request->input('start_date', '');
        $endDate = $request->input('end_date', '');

        $query = FailedLoginAttempt::with('user:id,name,email')
            ->orderBy('attempted_at', 'desc');

        // Search filter
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('email', 'like', "%{$search}%")
                  ->orWhere('ip_address', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%");
            });
        }

        // Filter by type
        if ($filter === 'suspended') {
            $query->where('resulted_in_suspension', true);
        } elseif ($filter === 'recent') {
            $query->where('attempted_at', '>=', now()->subHours(24));
        }

        // Date range filter
        if ($startDate) {
            $query->whereDate('attempted_at', '>=', $startDate);
        }
        if ($endDate) {
            $query->whereDate('attempted_at', '<=', $endDate);
        }

        $attempts = $query->paginate(20)
            ->withQueryString()
            ->through(fn($attempt) => [
                'id' => $attempt->id,
                'email' => $attempt->email,
                'user_id' => $attempt->user_id,
                'user_name' => $attempt->user->name ?? 'Unknown',
                'ip_address' => $attempt->ip_address,
                'user_agent' => $attempt->user_agent,
                'mac_address' => $attempt->mac_address,
                'location' => $attempt->location ?? 'Unknown',
                'photo_path' => $attempt->photo_path,
                'attempt_number' => $attempt->attempt_number,
                'resulted_in_suspension' => $attempt->resulted_in_suspension,
                'attempted_at' => $attempt->attempted_at->format('Y-m-d H:i:s'),
                'attempted_at_human' => $attempt->attempted_at->diffForHumans(),
            ]);

        // Statistics
        $stats = [
            'total_attempts' => FailedLoginAttempt::count(),
            'last_24h' => FailedLoginAttempt::where('attempted_at', '>=', now()->subHours(24))->count(),
            'resulted_in_suspension' => FailedLoginAttempt::where('resulted_in_suspension', true)->count(),
            'unique_ips' => FailedLoginAttempt::distinct('ip_address')->count(),
            'suspended_users' => User::where('is_suspended', true)->count(),
            
            // Hourly data for last 24 hours
            'hourly_data' => $this->getHourlyData(),
            
            // Top IPs with most attempts
            'top_ips' => $this->getTopIPs(),
        ];

        return Inertia::render('Admin/LoginSecurity/Index', [
            'attempts' => $attempts,
            'stats' => $stats,
            'filters' => [
                'search' => $search,
                'filter' => $filter,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'page' => $request->input('page', 1),
            ],
        ]);
    }

    /**
     * Display the specified failed login attempt.
     */
    public function show(FailedLoginAttempt $attempt)
    {
        $attempt->load('user:id,name,email,is_suspended,suspended_until,failed_login_count');

        // Get other attempts from same IP
        $sameIpAttempts = FailedLoginAttempt::where('ip_address', $attempt->ip_address)
            ->where('id', '!=', $attempt->id)
            ->orderBy('attempted_at', 'desc')
            ->limit(10)
            ->get()
            ->map(fn($a) => [
                'id' => $a->id,
                'email' => $a->email,
                'attempted_at' => $a->attempted_at->format('Y-m-d H:i:s'),
                'resulted_in_suspension' => $a->resulted_in_suspension,
            ]);

        return Inertia::render('Admin/LoginSecurity/Show', [
            'attempt' => [
                'id' => $attempt->id,
                'email' => $attempt->email,
                'user_id' => $attempt->user_id,
                'user' => $attempt->user ? [
                    'id' => $attempt->user->id,
                    'name' => $attempt->user->name,
                    'email' => $attempt->user->email,
                    'is_suspended' => $attempt->user->is_suspended,
                    'suspended_until' => $attempt->user->suspended_until?->format('Y-m-d H:i:s'),
                    'failed_login_count' => $attempt->user->failed_login_count,
                ] : null,
                'ip_address' => $attempt->ip_address,
                'user_agent' => $attempt->user_agent,
                'mac_address' => $attempt->mac_address,
                'location' => $attempt->location,
                'photo_path' => $attempt->photo_path,
                'attempt_number' => $attempt->attempt_number,
                'resulted_in_suspension' => $attempt->resulted_in_suspension,
                'attempted_at' => $attempt->attempted_at->format('Y-m-d H:i:s'),
                'attempted_at_human' => $attempt->attempted_at->diffForHumans(),
            ],
            'sameIpAttempts' => $sameIpAttempts,
        ]);
    }

    /**
     * Unsuspend a user.
     */
    public function unsuspend(User $user)
    {
        $user->update([
            'is_suspended' => false,
            'suspended_until' => null,
            'failed_login_count' => 0,
        ]);

        return redirect()->back()->with('success', 'User unsuspended successfully.');
    }

    /**
     * Delete a failed login attempt record.
     */
    public function destroy(FailedLoginAttempt $attempt)
    {
        $attempt->delete();

        return redirect()->route('admin.login-security.index')
            ->with('success', 'Failed login attempt record deleted.');
    }

    /**
     * Clear all failed login attempt records.
     */
    public function clear(Request $request)
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        FailedLoginAttempt::truncate();

        return redirect()->route('admin.login-security.index')
            ->with('success', 'All login security data has been cleared successfully.');
    }

    /**
     * Get hourly data for last 24 hours.
     */
    protected function getHourlyData(): array
    {
        $hourlyData = [];
        
        for ($i = 23; $i >= 0; $i--) {
            $hourStart = now()->subHours($i)->startOfHour();
            $hourEnd = $hourStart->copy()->endOfHour();
            
            $count = FailedLoginAttempt::whereBetween('attempted_at', [$hourStart, $hourEnd])->count();
            
            $hourlyData[] = [
                'hour' => $hourStart->format('H:i'),
                'count' => $count,
            ];
        }
        
        return $hourlyData;
    }

    /**
     * Get top IPs with most failed attempts.
     */
    protected function getTopIPs(): array
    {
        return FailedLoginAttempt::selectRaw('ip_address, location, COUNT(*) as count')
            ->groupBy('ip_address', 'location')
            ->orderByDesc('count')
            ->limit(5)
            ->get()
            ->map(fn($item) => [
                'ip' => $item->ip_address,
                'location' => $item->location ?? 'Unknown',
                'count' => $item->count,
            ])
            ->toArray();
    }
}
