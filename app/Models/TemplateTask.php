<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class TemplateTask extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'template_tasks';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'order',
        'name',
        'slug',
        'project_template_id',
        'template_working_step_id',
        'time',
        'comment',
        'client_comment',
        'client_interact',
        'multiple_files',
        'is_required',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'time' => 'datetime',
            'client_interact' => 'boolean',
            'multiple_files' => 'boolean',
            'is_required' => 'boolean',
        ];
    }

    /**
     * Boot method for model events
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->slug)) {
                $model->slug = $model->generateUniqueSlug($model->name);
            }
        });

        static::updating(function ($model) {
            if ($model->isDirty('name') && !$model->isDirty('slug')) {
                $model->slug = $model->generateUniqueSlug($model->name, $model->id);
            }
        });
    }

    /**
     * Generate unique slug
     */
    private function generateUniqueSlug($name, $excludeId = null)
    {
        $baseSlug = Str::slug($name);
        $slug = $baseSlug;
        $counter = 1;
        
        $query = static::where('slug', $slug);
        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }
        
        while ($query->exists()) {
            $slug = $baseSlug . '-' . $counter;
            $counter++;
            
            $query = static::where('slug', $slug);
            if ($excludeId) {
                $query->where('id', '!=', $excludeId);
            }
        }
        
        return $slug;
    }

    /**
     * Get the template working step that owns the template task.
     */
    public function templateWorkingStep(): BelongsTo
    {
        return $this->belongsTo(TemplateWorkingStep::class, 'template_working_step_id');
    }

    /**
     * Get the project template that owns the template task.
     */
    public function projectTemplate(): BelongsTo
    {
        return $this->belongsTo(ProjectTemplate::class);
    }
}
