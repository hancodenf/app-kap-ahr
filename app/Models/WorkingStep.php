<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Log;

class WorkingStep extends Model
{
    use HasFactory, HasUuids;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'order',
        'is_locked',
        'project_id',
        'project_name',
        'project_client_name',
        'name',
        'slug',
    ];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'is_locked' => 'boolean',
        ];
    }

    /**
     * Get the project that owns the working step.
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Get the tasks for the working step.
     */
    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    /**
     * Check if all required tasks are completed and unlock next step if ready
     */
    public function checkAndUnlockNextStep(): void
    {
        // Get all required tasks in this step
        $requiredTasksCount = $this->tasks()->where('is_required', true)->count();
        
        // If no required tasks, nothing to check
        if ($requiredTasksCount === 0) {
            return;
        }
        
        $completedRequiredTasksCount = $this->tasks()
            ->where('is_required', true)
            ->where('completion_status', 'completed')
            ->count();
        
        // If all required tasks are completed
        if ($requiredTasksCount === $completedRequiredTasksCount) {
            // Find and unlock the next step
            $nextStep = self::where('project_id', $this->project_id)
                ->where('order', '>', $this->order)
                ->orderBy('order', 'asc')
                ->first();
            
            if ($nextStep && $nextStep->is_locked) {
                $nextStep->update(['is_locked' => false]);
                
                // Optional: Log activity
                Log::info("Step '{$nextStep->name}' unlocked for project '{$this->project_name}'");
            }
        }
    }

    /**
     * Check if user can access this step (for company users)
     */
    public function canAccess($user): bool
    {
        // Admin always has full access
        if ($user->role === 'admin') {
            return true;
        }
        
        // First step is always accessible
        if ($this->order === 1) {
            return true;
        }
        
        // Check if step is unlocked
        return !$this->is_locked;
    }

    /**
     * Get required tasks progress for this step
     */
    public function getRequiredTasksProgress(): array
    {
        $requiredTasksCount = $this->tasks()->where('is_required', true)->count();
        $completedRequiredTasksCount = $this->tasks()
            ->where('is_required', true)
            ->where('completion_status', 'completed')
            ->count();
        
        return [
            'total' => $requiredTasksCount,
            'completed' => $completedRequiredTasksCount,
            'percentage' => $requiredTasksCount > 0 
                ? round(($completedRequiredTasksCount / $requiredTasksCount) * 100, 2)
                : 0
        ];
    }

}
