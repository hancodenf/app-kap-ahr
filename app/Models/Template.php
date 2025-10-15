<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Template extends Model
{
    use HasFactory;

    protected $fillable = [
        'level_id',
        'sub_level_id',
        'document_id',
        'document_name',
        'file',
        'time',
        'comment',
        'acc_partner',
        'acc_partner_id',
        'acc_partner_time',
        'for',
        'acc_klien',
        'acc_klien_id',
        'acc_klien_time',
    ];

    public function level()
    {
        return $this->belongsTo(Level::class);
    }

    public function subLevel()
    {
        return $this->belongsTo(SubLevel::class);
    }

    public function document()
    {
        return $this->belongsTo(Document::class);
    }

    public function accPartner()
    {
        return $this->belongsTo(User::class, 'acc_partner_id');
    }

    public function accKlien()
    {
        return $this->belongsTo(User::class, 'acc_klien_id');
    }
}
