<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TaskApproval extends Model
{
    use HasFactory, HasUuids;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'order',
        'task_id',
        'role',
        'task_name',
        'working_step_name',
        'project_name',
        'project_client_name',
        'status_name_pending',
        'status_name_progress',
        'status_name_reject',
        'status_name_complete',
    ];

    /**
     * Get the task that owns the task approval.
     */
    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }
}
