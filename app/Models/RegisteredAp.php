<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RegisteredAp extends Model
{
    use HasFactory, HasUuids;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'ap_number',
        'registration_date',
        'expiry_date',
        'status',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'registration_date' => 'date',
            'expiry_date' => 'date',
        ];
    }

    /**
     * Get the user that owns the registered AP.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the status badge color
     */
    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            'active' => 'green',
            'inactive' => 'gray',
            'expired' => 'red',
            default => 'gray',
        };
    }

    /**
     * Get formatted registration date
     */
    public function getFormattedRegistrationDateAttribute(): string
    {
        return $this->registration_date?->format('d M Y') ?? '-';
    }

    /**
     * Get formatted expiry date
     */
    public function getFormattedExpiryDateAttribute(): string
    {
        return $this->expiry_date?->format('d M Y') ?? '-';
    }

    /**
     * Check if AP is expired
     */
    public function isExpired(): bool
    {
        return $this->expiry_date && $this->expiry_date->isPast();
    }

    /**
     * Scope for active APs
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope for expired APs
     */
    public function scopeExpired($query)
    {
        return $query->where('status', 'expired');
    }

    /**
     * Scope for search
     */
    public function scopeSearch($query, $search)
    {
        return $query->when($search, function ($query, $search) {
            $query->where('ap_number', 'like', "%{$search}%")
                ->orWhereHas('user', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
        });
    }
}
