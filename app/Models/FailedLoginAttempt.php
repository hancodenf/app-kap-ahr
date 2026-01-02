<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FailedLoginAttempt extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'email',
        'user_id',
        'ip_address',
        'user_agent',
        'mac_address',
        'location',
        'photo_path',
        'attempt_number',
        'resulted_in_suspension',
        'attempted_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'attempted_at' => 'datetime',
            'resulted_in_suspension' => 'boolean',
        ];
    }

    /**
     * Get the user that owns the failed login attempt.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get location from IP address (simplified)
     */
    public static function getLocationFromIP(string $ip): ?string
    {
        // In production, use a service like ipapi.co or ipinfo.io
        // For now, return a placeholder
        if ($ip === '127.0.0.1' || $ip === '::1') {
            return 'Localhost';
        }
        
        // Example API call (you need to implement this with actual API)
        // $response = Http::get("http://ip-api.com/json/{$ip}");
        // return $response->json()['city'] . ', ' . $response->json()['country'];
        
        return null;
    }
}
