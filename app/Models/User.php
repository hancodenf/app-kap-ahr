<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Notifications\ResetPasswordNotification;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasUuids;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'profile_photo',
        'password',
        'role',
        'position',
        'user_type',
        'client_id',
        'is_active',
        'whatsapp',
        'is_suspended',
        'suspended_until',
        'failed_login_count',
        'last_failed_login',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
            'is_suspended' => 'boolean',
            'suspended_until' => 'datetime',
            'last_failed_login' => 'datetime',
        ];
    }

    /**
     * Get the client this user belongs to (for user accounts under a client).
     * This is for user accounts with role 'client' linked to a client.
     */
    public function belongsToClient(): BelongsTo
    {
        return $this->belongsTo(Client::class, 'client_id');
    }

    /**
     * Get the project teams for the user.
     */
    public function projectTeams(): HasMany
    {
        return $this->hasMany(ProjectTeam::class);
    }

    /**
     * Get the projects associated with the user through project teams.
     */
    public function projects(): BelongsToMany
    {
        return $this->belongsToMany(Project::class, 'project_teams')->withPivot('role')->withTimestamps();
    }

    /**
     * Get the registered AP associated with the user.
     */
    public function registeredAp(): HasOne
    {
        return $this->hasOne(RegisteredAp::class);
    }

    /**
     * Get the activity logs for the user.
     */
    public function activityLogs(): HasMany
    {
        return $this->hasMany(ActivityLog::class);
    }

    /**
     * Get the failed login attempts for the user.
     */
    public function failedLoginAttempts(): HasMany
    {
        return $this->hasMany(FailedLoginAttempt::class);
    }

    /**
     * Get the news articles created by the user.
     */
    public function news(): HasMany
    {
        return $this->hasMany(News::class, 'created_by');
    }

    /**
     * Check if user is currently suspended.
     */
    public function isSuspended(): bool
    {
        if (!$this->is_suspended) {
            return false;
        }

        if ($this->suspended_until && now()->greaterThan($this->suspended_until)) {
            // Suspension expired, auto-unsuspend
            $this->update([
                'is_suspended' => false,
                'suspended_until' => null,
                'failed_login_count' => 0,
            ]);
            return false;
        }

        return true;
    }

    /**
     * Send the password reset notification.
     *
     * @param  string  $token
     * @return void
     */
    public function sendPasswordResetNotification($token): void
    {
        $this->notify(new ResetPasswordNotification($token));
    }
}
