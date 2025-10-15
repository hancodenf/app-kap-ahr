<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditKlien extends Model
{
    protected $table = 'audit_klien';

    protected $fillable = [
        'klien_id',
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

    // Relationships
    public function klien()
    {
        return $this->belongsTo(User::class, 'klien_id');
    }

    public function level()
    {
        return $this->belongsTo(Level::class, 'level_id');
    }

    public function subLevel()
    {
        return $this->belongsTo(SubLevel::class, 'sub_level_id');
    }

    public function document()
    {
        return $this->belongsTo(Document::class, 'document_id');
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
