<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Level extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'slug',
    ];

    /**
     * Get the sub levels for the level.
     */
    public function subLevels(): HasMany
    {
        return $this->hasMany(SubLevel::class);
    }

    /**
     * Get the sub levels for the level (alternative method name).
     */
    public function sub_levels(): HasMany
    {
        return $this->hasMany(SubLevel::class);
    }
}
