<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SubStepWorker extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'working_sub_step_id',
        'project_team_id',
        'working_sub_step_name',
        'working_step_name',
        'project_name',
        'project_client_name',
        'worker_name',
        'worker_email',
        'worker_role',
    ];

    /**
     * Get the working sub step that owns the sub step worker.
     */
    public function workingSubStep(): BelongsTo
    {
        return $this->belongsTo(WorkingSubStep::class);
    }

    /**
     * Get the project team that owns the sub step worker.
     */
    public function projectTeam(): BelongsTo
    {
        return $this->belongsTo(ProjectTeam::class);
    }
}
