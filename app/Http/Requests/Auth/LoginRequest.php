<?php

namespace App\Http\Requests\Auth;

use App\Models\FailedLoginAttempt;
use App\Models\User;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ];
    }

    /**
     * Attempt to authenticate the request's credentials.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        // Check if user exists and is suspended
        $user = User::where('email', $this->email)->first();
        
        if ($user && $user->isSuspended()) {
            $suspendedUntil = $user->suspended_until ? $user->suspended_until->format('Y-m-d H:i:s') : 'permanently';
            
            throw ValidationException::withMessages([
                'email' => "Account suspended due to multiple failed login attempts. Suspended until: {$suspendedUntil}",
            ]);
        }

        if (! Auth::attempt($this->only('email', 'password'), $this->boolean('remember'))) {
            RateLimiter::hit($this->throttleKey());

            // Track failed login attempt
            $this->trackFailedLogin($user);

            throw ValidationException::withMessages([
                'email' => trans('auth.failed'),
            ]);
        }

        // Check if user account is active
        $user = Auth::user();
        if ($user && !$user->is_active) {
            Auth::logout();
            
            throw ValidationException::withMessages([
                'email' => 'Your account has been deactivated. Please contact administrator to reactivate your account.',
            ]);
        }

        // Reset failed login count on successful login
        if ($user) {
            $user->update([
                'failed_login_count' => 0,
                'last_failed_login' => null,
            ]);
        }

        RateLimiter::clear($this->throttleKey());
    }

    /**
     * Track failed login attempt with graduated penalties.
     */
    protected function trackFailedLogin(?User $user): void
    {
        $email = $this->email;
        $ip = $this->ip();
        $userAgent = $this->userAgent();
        
        // Get location from IP (you can use a service like ipapi.co)
        $location = FailedLoginAttempt::getLocationFromIP($ip);

        // Count recent failed attempts for this email (within last hour)
        $recentAttempts = FailedLoginAttempt::where('email', $email)
            ->where('attempted_at', '>=', now()->subHour())
            ->count();

        $attemptNumber = $recentAttempts + 1;
        $resultedInSuspension = false;

        // Update user's failed login count if user exists
        if ($user) {
            $failedCount = $user->failed_login_count + 1;
            
            $user->update([
                'failed_login_count' => $failedCount,
                'last_failed_login' => now(),
            ]);

            // Graduated penalty system
            if ($failedCount >= 3) {
                // Suspend account with increasing duration
                $suspensionMinutes = $this->calculateSuspensionDuration($failedCount);
                
                $user->update([
                    'is_suspended' => true,
                    'suspended_until' => now()->addMinutes($suspensionMinutes),
                ]);
                
                $resultedInSuspension = true;
            }
        }

        // Create failed login attempt record
        FailedLoginAttempt::create([
            'email' => $email,
            'user_id' => $user?->id,
            'ip_address' => $ip,
            'user_agent' => $userAgent,
            'mac_address' => null,
            'location' => $location,
            'photo_path' => null,
            'attempt_number' => $attemptNumber,
            'resulted_in_suspension' => $resultedInSuspension,
            'attempted_at' => now(),
        ]);
    }

    /**
     * Calculate suspension duration based on failed login count.
     * Graduated penalties: 3rd = 15 min, 4th = 30 min, 5th = 1 hour, 6th+ = 24 hours
     */
    protected function calculateSuspensionDuration(int $failedCount): int
    {
        return match(true) {
            $failedCount >= 6 => 1440, // 24 hours
            $failedCount >= 5 => 60,   // 1 hour
            $failedCount >= 4 => 30,   // 30 minutes
            $failedCount >= 3 => 15,   // 15 minutes
            default => 0,
        };
    }

    /**
     * Ensure the login request is not rate limited.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            'email' => trans('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

    /**
     * Get the rate limiting throttle key for the request.
     */
    public function throttleKey(): string
    {
        return Str::transliterate(Str::lower($this->string('email')).'|'.$this->ip());
    }
}
