<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditKlien extends Model
{
    protected $table = 'audit_klien';

    protected $fillable = [
        'klien_id',
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
}
