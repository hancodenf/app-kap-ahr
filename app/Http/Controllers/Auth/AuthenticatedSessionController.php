<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        // Get demo users for quick login
        $demoUsers = [
            'admin' => User::where('role', 'admin')->first(),
            'tenaga_ahli' => User::where('user_type', 'Tenaga Ahli')
                ->where('role', 'company')
                ->orderBy('name')
                ->get()
                ->map(fn($user) => [
                    'name' => $user->name,
                    'email' => $user->email,
                    'position' => $user->position,
                    'initials' => $this->getInitials($user->name),
                ]),
            'staff' => User::where('user_type', 'Staff')
                ->where('role', 'company')
                ->orderBy('name')
                ->get()
                ->map(fn($user) => [
                    'name' => $user->name,
                    'email' => $user->email,
                    'position' => $user->position,
                    'initials' => $this->getInitials($user->name),
                ]),
            'client' => User::where('role', 'client')->first(),
        ];

        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
            'demoUsers' => $demoUsers,
        ]);
    }

    /**
     * Get initials from name
     */
    private function getInitials(string $name): string
    {
        $words = explode(' ', $name);
        if (count($words) >= 2) {
            return strtoupper(substr($words[0], 0, 1) . substr($words[1], 0, 1));
        }
        return strtoupper(substr($name, 0, 2));
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        return redirect()->intended(route('dashboard', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
