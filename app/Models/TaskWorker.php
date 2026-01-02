<?php

namespace App\Models;

use App\Traits\OptimisticLockingTrait;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TaskWorker extends Model
{
    use HasFactory, HasUuids, OptimisticLockingTrait;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'task_id',
        'project_team_id',
        'task_name',
        'working_step_name',
        'project_name',
        'project_client_name',
        'worker_name',
        'worker_email',
        'worker_role',
        'version',
        'last_modified_by',
        'last_modified_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'version' => 'integer',
        'last_modified_at' => 'datetime',
    ];

    /**
     * Get the task that owns the task worker.
     */
    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    /**
     * Get the project team that owns the task worker.
     */
    public function projectTeam(): BelongsTo
    {
        return $this->belongsTo(ProjectTeam::class);
    }
}
