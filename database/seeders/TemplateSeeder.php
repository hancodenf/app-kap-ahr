<?php

namespace Database\Seeders;

use App\Models\Template;
use App\Models\SubLevel;
use App\Models\Document;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TemplateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all sub_levels and create template entries
        $subLevels = SubLevel::all();

        $docForKlien = [
            "Form Permintaan Data",
            "Surat Representasi Awal", 
            "Berita Acara (BA) Stock Opname",
            "Berita Acara (BA) Aset Opname",
            "BA Cash Opname",
            "BA Inquiry",
            "Daftar permintaan data tambahan",
            "Daftar temuan dari masing masing PIC dan ppt exit meeting",
            "Daftar Adjustment",
            "Draft LK Audited",
            "Draft Laporan Kepatuhan",
            "Draft Management Letter",
            "AFP Draft LK Audited",
            "AFP Draft Laporan Kepatuhan",
            "AFP Draft Management Letter",
            "Surat Pernyataan Manajemen",
            "Surat Representatif",
            "Surat Penyampaian LK ke P2PK"
        ];
        
        foreach ($subLevels as $subLevel) {
            // Get all documents for this sub_level
            $documents = Document::where('sub_level_id', $subLevel->id)->get();
            
            if ($documents->count() > 0) {
                foreach ($documents as $doc) {
                    $for = 'kap'; // Default value
                    if (in_array($doc->name, $docForKlien)) {
                        $for = 'klien';
                    } 
                    Template::create([
                        'level_id' => $subLevel->level_id,
                        'sub_level_id' => $subLevel->id,
                        'document_id' => $doc->id,
                        'document_name' => $doc->name,
                        'file' => null,
                        'time' => null,
                        'comment' => null,
                        'acc_partner' => 'false',
                        'acc_partner_id' => null,
                        'acc_partner_time' => null,
                        'for' => $for,
                        'acc_klien' => 'false',
                        'acc_klien_id' => null,
                        'acc_klien_time' => null,
                    ]);
                }
            } else {
                // If no document, create with document_name only
                Template::create([
                    'level_id' => $subLevel->level_id,
                    'sub_level_id' => $subLevel->id,
                    'document_id' => null,
                    'document_name' => $subLevel->name . ' Document',
                    'file' => null,
                    'time' => null,
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
