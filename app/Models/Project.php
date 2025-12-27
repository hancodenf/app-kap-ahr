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
     * Get the route key for the model.
     *
     * @return string
     */
    public function getRouteKeyName()
    {
        return 'slug';
    }

    /**
     * Retrieve the model for a bound value.
     * Support both ID (UUID) and slug for backward compatibility.
     *
     * @param  mixed  $value
     * @param  string|null  $field
     * @return \Illuminate\Database\Eloquent\Model|null
     */
    public function resolveRouteBinding($value, $field = null)
    {
        // If field is explicitly specified, use parent behavior
        if ($field) {
            return parent::resolveRouteBinding($value, $field);
        }

        // Try to find by slug first (preferred)
        $model = $this->where('slug', $value)->first();
        
        // If not found and value looks like UUID, try by ID (backward compatibility)
        if (!$model && preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $value)) {
            $model = $this->where('id', $value)->first();
        }

        return $model;
    }

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
