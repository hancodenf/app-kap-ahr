<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Task extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'order',
        'name',
        'slug',
        'project_id',
        'working_step_id',
        'project_name',
        'project_client_name',
        'working_step_name',
        'time',
        'comment',
        'client_comment',
        'client_interact',
        'multiple_files',
        'status',
    ];

    /**
     * Get the working step that owns the task.
     */
    public function workingStep(): BelongsTo
    {
        return $this->belongsTo(WorkingStep::class);
    }

    /**
     * Get the project that owns the task.
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Get the task workers for the task.
     */
    public function taskWorkers(): HasMany
    {
        return $this->hasMany(TaskWorker::class);
    }

    /**
     * Get the documents for the task.
     */
    public function documents(): HasMany
    {
        return $this->hasMany(Document::class);
    }
}
