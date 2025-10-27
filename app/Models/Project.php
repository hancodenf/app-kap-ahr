<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Project extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'client_id',
        'client_name',
        'client_alamat',
        'client_kementrian',
        'client_kode_satker',
    ];

    /**
     * Get the client that owns the project.
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    /**
     * Get the project teams for the project.
     */
    public function projectTeams(): HasMany
    {
        return $this->hasMany(ProjectTeam::class);
    }

    /**
     * Get the working steps for the project.
     */
    public function workingSteps(): HasMany
    {
        return $this->hasMany(WorkingStep::class);
    }

    /**
     * Get the working sub steps for the project.
     */
    public function workingSubSteps(): HasMany
    {
        return $this->hasMany(WorkingSubStep::class);
    }

    /**
     * Get the users associated with the project through project teams.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'project_teams')->withPivot('role')->withTimestamps();
    }
}
