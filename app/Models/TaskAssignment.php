<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Traits\OptimisticLockingTrait;

class TaskAssignment extends Model
{
    use HasFactory, HasUuids, OptimisticLockingTrait;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'task_id',
        'task_name',
        'working_step_name',
        'project_name',
        'project_client_name',
        'time',
        'comment',
        'notes',
        'client_comment',
        'maker',
        'maker_can_edit',
        'status',
        'version',
        'last_modified_at',
        'last_modified_by',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'time' => 'datetime',
            'last_modified_at' => 'datetime',
            'version' => 'integer',
        ];
    }

    /**
     * Get the task that owns the assignment.
     */
    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    /**
     * Get the documents for the assignment.
     */
    public function documents(): HasMany
    {
        return $this->hasMany(Document::class);
    }

    /**
     * Get the client documents for the assignment.
     */
    public function clientDocuments(): HasMany
    {
        return $this->hasMany(ClientDocument::class);
    }
}
