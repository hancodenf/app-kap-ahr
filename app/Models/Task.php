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
        'client_interact',
        'multiple_files',
        'is_required',
        'completion_status',
        'status',
    ];

    /**
     * Valid status values for tasks
     */
    const STATUS_DRAFT = 'Draft';
    const STATUS_SUBMITTED = 'Submitted';
    const STATUS_UNDER_REVIEW_TEAM_LEADER = 'Under Review by Team Leader';
    const STATUS_APPROVED_TEAM_LEADER = 'Approved by Team Leader';
    const STATUS_RETURNED_TEAM_LEADER = 'Returned for Revision (by Team Leader)';
    const STATUS_UNDER_REVIEW_MANAGER = 'Under Review by Manager';
    const STATUS_APPROVED_MANAGER = 'Approved by Manager';
    const STATUS_RETURNED_MANAGER = 'Returned for Revision (by Manager)';
    const STATUS_UNDER_REVIEW_SUPERVISOR = 'Under Review by Supervisor';
    const STATUS_APPROVED_SUPERVISOR = 'Approved by Supervisor';
    const STATUS_RETURNED_SUPERVISOR = 'Returned for Revision (by Supervisor)';
    const STATUS_UNDER_REVIEW_PARTNER = 'Under Review by Partner';
    const STATUS_APPROVED_PARTNER = 'Approved by Partner';
    const STATUS_RETURNED_PARTNER = 'Returned for Revision (by Partner)';
    const STATUS_SUBMITTED_TO_CLIENT = 'Submitted to Client';
    const STATUS_CLIENT_REPLY = 'Client Reply';

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'client_interact' => 'boolean',
            'multiple_files' => 'boolean',
            'is_required' => 'boolean',
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
}
