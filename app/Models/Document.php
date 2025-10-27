<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Document extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'working_sub_step_id',
        'working_sub_step_name',
        'working_step_name',
        'project_name',
        'project_client_name',
        'name',
        'slug',
        'file',
        'uploaded_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'uploaded_at' => 'datetime',
        ];
    }

    /**
     * Get the working sub step that owns the document.
     */
    public function workingSubStep(): BelongsTo
    {
        return $this->belongsTo(WorkingSubStep::class);
    }
}
