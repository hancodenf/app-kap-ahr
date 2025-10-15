<?php

namespace Database\Seeders;

use App\Models\AuditKlien;
use App\Models\User;
use App\Models\SubLevel;
use App\Models\Document;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class AuditKlienSeeder extends Seeder
{
    public function run(): void
    {
        // Get a user with role 'klien'
        $klien = User::whereHas('role', function($q) { $q->where('name', 'klien'); })->first();
        if (!$klien) return;

        // Get all sub_levels and documents
        $subLevels = SubLevel::all();
        foreach ($subLevels as $subLevel) {
            // Get all documents for this sub_level
            $documents = Document::where('sub_level_id', $subLevel->id)->get();
            if ($documents->count() > 0) {
                foreach ($documents as $doc) {
                    AuditKlien::create([
                        'klien_id' => $klien->id,
                        'sub_level_id' => $subLevel->id,
                        'document_id' => $doc->id,
                        'document_name' => $doc->name,
                        'file' => null,
                        'time' => now(),
                        'comment' => null,
                        'acc_partner' => 'false',
                        'acc_partner_id' => null,
                        'acc_partner_time' => null,
                        'for' => 'kap',
                        'acc_klien' => 'false',
                        'acc_klien_id' => null,
                        'acc_klien_time' => null,
                    ]);
                }
            } else {
                // If no document, create with document_name only
                AuditKlien::create([
                    'klien_id' => $klien->id,
                    'sub_level_id' => $subLevel->id,
                    'document_id' => null,
                    'document_name' => $subLevel->name . ' Document',
                    'file' => null,
                    'time' => now(),
                    'comment' => null,
                    'acc_partner' => 'false',
                    'acc_partner_id' => null,
                    'acc_partner_time' => null,
                    'for' => 'kap',
                    'acc_klien' => 'false',
                    'acc_klien_id' => null,
                    'acc_klien_time' => null,
                ]);
            }
        }
    }
}
