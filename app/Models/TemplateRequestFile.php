<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class TemplateRequestFile extends Model
{
    use HasUuids;

    protected $table = 'template_request_files';

    protected $fillable = [
        'request_list',
        'project_template_id',
    ];

    protected $casts = [
        'request_list' => 'array',
    ];

    public function projectTemplate()
    {
        return $this->belongsTo(ProjectTemplate::class, 'project_template_id');
    }
}
