<?php

namespace App\Models;

use App\Traits\OptimisticLockingTrait;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClientDocument extends Model
{
    use HasFactory, HasUuids, OptimisticLockingTrait;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'task_assignment_id',
        'name',
        'description',
        'slug',
        'file',
        'uploaded_at',
        'version',
        'last_modified_by',
        'last_modified_at',
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
            'version' => 'integer',
            'last_modified_at' => 'datetime',
        ];
    }

    /**
     * Get the task assignment that owns the client document.
     */
    public function taskAssignment(): BelongsTo
    {
        return $this->belongsTo(TaskAssignment::class);
    }
}
