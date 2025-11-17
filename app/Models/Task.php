<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Support\Facades\DB;

class Task extends Model
{
    use HasFactory, HasUuids;

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
        'client_interact',
        'multiple_files',
        'is_required',
        'completion_status',
        'completed_at',
    ];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'multiple_files' => 'boolean',
            'is_required' => 'boolean',
            'completed_at' => 'datetime',
        ];
    }

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
     * Get the task assignments for the task.
     */
    public function taskAssignments(): HasMany
    {
        return $this->hasMany(TaskAssignment::class);
    }

    /**
     * Get the task approvals for the task.
     */
    public function taskApprovals(): HasMany
    {
        return $this->hasMany(TaskApproval::class);
    }

    /**
     * Get the assigned users for the task through task workers and project teams.
     */
    public function assignedUsers(): BelongsToMany
    {
        return $this->belongsToMany(
            User::class,
            'task_workers',
            'task_id',
            'project_team_id'
        )
        ->join('project_teams', 'project_teams.id', '=', 'task_workers.project_team_id')
        ->where('project_teams.user_id', '=', DB::raw('users.id'))
        ->select('users.*', 'project_teams.role as team_role');
    }

    /**
     * Mark task as completed and check if next step should be unlocked
     */
    public function markAsCompleted(): void
    {
        $this->update(['completion_status' => 'completed']);
        
        // Check if this unlocks the next step (only for required tasks)
        if ($this->is_required) {
            $this->workingStep->checkAndUnlockNextStep();
        }
    }

    /**
     * Mark task as in progress
     */
    public function markAsInProgress(): void
    {
        $this->update(['completion_status' => 'in_progress']);
    }

    /**
     * Mark task as pending
     */
    public function markAsPending(): void
    {
        $this->update(['completion_status' => 'pending']);
    }

    /**
     * Get the storage path for this task relative to storage/app/public.
     * Format: clients/{client_slug}/{project_slug}/{task_slug}
     * 
     * @return string
     */
    public function getStoragePath(): string
    {
        // Get slugs from denormalized data or from relationships
        $clientSlug = $this->project && $this->project->client 
            ? $this->project->client->slug 
            : \Illuminate\Support\Str::slug($this->project_client_name);
        
        $projectSlug = $this->project 
            ? $this->project->slug 
            : \Illuminate\Support\Str::slug($this->project_name);
        
        return "clients/{$clientSlug}/{$projectSlug}/{$this->slug}";
    }

    /**
     * Get the full storage path (with storage/app/public prefix).
     * 
     * @return string
     */
    public function getFullStoragePath(): string
    {
        return storage_path("app/public/{$this->getStoragePath()}");
    }
}
