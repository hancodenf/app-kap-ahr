<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class BlackboxTestSession extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'token',
        'tester_name',
        'test_date',
        'app_version',
        'browser_platform',
    ];

    protected $casts = [
        'test_date' => 'date',
    ];

    public function results()
    {
        return $this->hasMany(BlackboxTestResult::class, 'session_id');
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->token)) {
                $model->token = Str::random(32);
            }
        });
    }
}
