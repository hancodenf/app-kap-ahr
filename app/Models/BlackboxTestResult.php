<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BlackboxTestResult extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'session_id',
        'module_name',
        'test_number',
        'feature_name',
        'test_scenario',
        'expected_result',
        'actual_result',
        'conclusion',
    ];

    public function session()
    {
        return $this->belongsTo(BlackboxTestSession::class, 'session_id');
    }
}
