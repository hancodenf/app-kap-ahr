<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WorkingStep extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'order',
        'project_id',
        'project_name',
        'project_client_name',
        'name',
        'slug',
    ];

    /**
     * Get the project that owns the working step.
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Get the working sub steps for the working step.
     */
    public function workingSubSteps(): HasMany
    {
        return $this->hasMany(WorkingSubStep::class);
    }
}
