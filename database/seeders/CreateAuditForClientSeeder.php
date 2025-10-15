<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Template;
use App\Models\AuditKlien;

class CreateAuditForClientSeeder extends Seeder
{
    public function run()
    {
        // Get test client
        $client = User::whereHas('role', function($q) {
            $q->where('name', 'klien');
        })->first();

        if (!$client) {
            echo "No client found\n";
            return;
        }

        // Clear existing audit data for this client
        AuditKlien::where('klien_id', $client->id)->delete();

        // Get templates with relationships
        $templates = Template::with(['level', 'subLevel', 'document'])->get();
        
        $createdCount = 0;
        foreach ($templates as $template) {
            $levelId = $template->level_id ?? ($template->subLevel ? $template->subLevel->level_id : null);
            
            AuditKlien::create([
                'klien_id' => $client->id,
                'level_id' => $levelId,
                'sub_level_id' => $template->sub_level_id,
                'document_id' => $template->document_id,
                'document_name' => $template->document_name ?? ($template->document ? $template->document->name : null),
                'file' => $template->file,
                'time' => $template->time,
                'comment' => $template->comment,
                'acc_partner' => $template->acc_partner ?? 'false',
                'acc_partner_id' => $template->acc_partner_id,
                'acc_partner_time' => $template->acc_partner_time,
                'for' => $template->for ?? 'kap',
                'acc_klien' => $template->acc_klien ?? 'false',
                'acc_klien_id' => $template->acc_klien_id,
                'acc_klien_time' => $template->acc_klien_time,
            ]);
            $createdCount++;
        }
        
        echo "Created {$createdCount} audit records for client {$client->name}\n";
    }
}