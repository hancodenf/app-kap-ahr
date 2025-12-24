<?php

namespace App\Models;

use App\Traits\OptimisticLockingTrait;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectDocumentRequest extends Model
{
    use HasFactory, HasUuids, OptimisticLockingTrait;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'project_id',
        'requested_by_user_id',
        'requested_by_name',
        'requested_by_role',
        'document_name',
        'description',
        'status',
        'file_path',
        'uploaded_at',
        'version',
        'last_modified_by',
        'last_modified_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'uploaded_at' => 'datetime',
            'version' => 'integer',
            'last_modified_at' => 'datetime',
        ];
    }

    /**
     * Get the project that owns the document request.
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Get the user who requested the document.
     */
    public function requestedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by_user_id');
    }

    /**
     * Scope to get pending requests
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope to get uploaded requests
     */
    public function scopeUploaded($query)
    {
        return $query->where('status', 'uploaded');
    }

    /**
     * Scope to get completed requests
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Check if document has been uploaded
     */
    public function isUploaded(): bool
    {
        return $this->status === 'uploaded' || $this->status === 'completed';
    }

    /**
     * Mark as uploaded
     */
    public function markAsUploaded(string $filePath): void
    {
        $this->updateSafely([
            'status' => 'uploaded',
            'file_path' => $filePath,
            'uploaded_at' => now(),
        ], $this->version);
    }

    /**
     * Mark as completed
     */
    public function markAsCompleted(): void
    {
        $this->updateSafely([
            'status' => 'completed',
        ], $this->version);
    }
}
