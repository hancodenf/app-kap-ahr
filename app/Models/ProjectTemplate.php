<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProjectTemplate extends Model
{
    use HasFactory, HasUuids;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            //
        ];
    }

    /**
     * Get the template working steps for the project template.
     */
    public function templateWorkingSteps(): HasMany
    {
        return $this->hasMany(TemplateWorkingStep::class);
    }

    /**
     * Get the template tasks for the project template.
     */
    public function templateTasks(): HasMany
    {
        return $this->hasMany(TemplateTask::class);
    }
}
