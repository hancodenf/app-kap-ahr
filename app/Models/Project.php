<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use App\Traits\OptimisticLockingTrait;

class Project extends Model
{
    use HasFactory, HasUuids, OptimisticLockingTrait;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'slug',
        'status',
        'is_archived',
        'client_id',
        'year',
        'client_name',
        'client_alamat',
        'client_kementrian',
        'client_kode_satker',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_archived' => 'boolean',
        'year' => 'integer',
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
     * Get the tasks for the project.
     */
    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    /**
     * Get the working sub steps for the project.
     * @deprecated Use tasks() instead
     */
    public function workingSubSteps(): HasMany
    {
        return $this->tasks();
    }

    /**
     * Get the users associated with the project through project teams.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'project_teams')->withPivot('role')->withTimestamps();
    }

    /**
     * Get the storage path for this project relative to storage/app/public.
     * Format: clients/{client_slug}/{project_slug}
     * 
     * @return string
     */
    public function getStoragePath(): string
    {
        // Get client slug from denormalized data or from relationship
        $clientSlug = $this->client ? $this->client->slug : \Illuminate\Support\Str::slug($this->client_name);
        
        return "clients/{$clientSlug}/projects/{$this->slug}";
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
