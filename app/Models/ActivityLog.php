<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActivityLog extends Model
{
    protected $fillable = [
        'user_id',
        'user_name',
        'user_email',
        'user_role',
        'action_type',
        'action',
        'target_type',
        'target_id',
        'target_name',
        'description',
        'meta',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'meta' => 'array',
    ];

    /**
     * 🔹 Relasi ke user yang melakukan aksi.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * 🔹 Relasi ke target aksi (bisa Project, Task, Document, dll).
     */
    public function target(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * 🔹 Getter deskripsi default kalau belum diset.
     */
    public function getReadableDescriptionAttribute(): string
    {
        if ($this->description) {
            return $this->description;
        }

        $targetName = $this->target_name ?? class_basename($this->target_type ?? '');
        return sprintf(
            '%s performed "%s" on %s (%s)',
            $this->user_name ?? 'System',
            $this->action,
            strtolower($targetName),
            $this->created_at->format('Y-m-d H:i')
        );
    }

    /**
     * 🔹 Scope filter berdasarkan tipe aksi.
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('action_type', $type);
    }

    /**
     * 🔹 Scope filter berdasarkan user.
     */
    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * 🔹 Scope filter berdasarkan rentang tanggal.
     */
    public function scopeBetween($query, $start, $end)
    {
        return $query->whereBetween('created_at', [$start, $end]);
    }
}
