<?php

namespace App\Http\Controllers;

use App\Models\AuditKlien;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AuditController extends Controller
{
    /**
     * Display list of clients to choose from
     */
    public function index(Request $request)
    {
        $clients = User::with('role')
                      ->whereHas('role', function ($query) {
                          $query->where('name', 'klien');
                      })
                      ->when($request->search, function ($query, $search) {
                          $query->where('name', 'like', '%' . $search . '%')
                                ->orWhere('email', 'like', '%' . $search . '%');
                      })
                      ->orderBy('name')
                      ->paginate(10)
                      ->withQueryString();

        return Inertia::render('Admin/Audit/Index', [
            'clients' => $clients,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Display audit data for specific client
     */
    public function show(User $client)
    {
        // Ensure the user is a client
        if (!$client->role || $client->role->name !== 'klien') {
            return redirect()->route('admin.audit.index')
                           ->with('error', 'User yang dipilih bukan klien.');
        }

        // Get audit data for the client
        $auditDataQuery = AuditKlien::with(['level', 'subLevel', 'document'])
                                   ->where('klien_id', $client->id);

        // Check if any audit data exists for this client
        $hasAuditData = $auditDataQuery->exists(); 

        if ($hasAuditData) {
            // Get the data with proper relationships and group by level
            $auditData = $auditDataQuery->whereNotNull('level_id')
                                       ->whereNotNull('sub_level_id')
                                       ->whereNotNull('document_id')
                                       ->orderBy('level_id')
                                       ->orderBy('sub_level_id')
                                       ->orderBy('document_id')
                                       ->get()
                                       ->groupBy(function($item) {
                                           return $item->level ? $item->level->name : 'Level Tidak Diketahui';
                                       });
        } else {
            $auditData = collect();
        } 

        return Inertia::render('Admin/Audit/Show', [
            'client' => $client,
            'auditData' => $auditData,
            'hasAuditData' => $hasAuditData,
        ]);
    }

    /**
     * Generate audit data from templates for a client
     */
    public function generateFromTemplate(User $client)
    {
        // Ensure the user is a client
        if (!$client->role || $client->role->name !== 'klien') {
            return redirect()->route('admin.audit.index')
                           ->with('error', 'User yang dipilih bukan klien.');
        }

        // Check if client already has audit data
        $existingData = AuditKlien::where('klien_id', $client->id)->count();
        if ($existingData > 0) {
            return redirect()->route('admin.audit.show', $client)
                           ->with('error', 'Klien ini sudah memiliki data audit.');
        }

        // Get all templates and create audit data for client
        $templates = \App\Models\Template::with(['level', 'subLevel', 'document'])->get();
        
        if ($templates->isEmpty()) {
            return redirect()->route('admin.audit.show', $client)
                           ->with('error', 'Tidak ada template yang tersedia. Silakan buat template terlebih dahulu.');
        } 
        
        $createdCount = 0;
        foreach ($templates as $template) {
            // Get level_id from sub_level relationship if not directly available
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

        return redirect()->route('admin.audit.show', $client)
                        ->with('success', "Berhasil generate {$createdCount} data audit dari template untuk klien {$client->name}.");
    }

    /**
     * Show edit form for specific audit data
     */
    public function edit(AuditKlien $auditKlien)
    {
        $auditKlien->load(['level', 'subLevel', 'document', 'klien']);

        return Inertia::render('Admin/Audit/Edit', [
            'auditKlien' => $auditKlien,
        ]);
    }

    /**
     * Update specific audit data
     */
    public function update(Request $request, AuditKlien $auditKlien)
    {
        $request->validate([
            'document_name' => 'nullable|string|max:255',
            'file' => 'nullable|string|max:255',
            'time' => 'nullable|date',
            'comment' => 'nullable|string',
            'acc_partner' => 'required|in:true,false',
            'for' => 'required|in:klien,kap',
            'acc_klien' => 'required|in:true,false',
        ]);

        $auditKlien->update([
            'document_name' => $request->document_name,
            'file' => $request->file,
            'time' => $request->time,
            'comment' => $request->comment,
            'acc_partner' => $request->acc_partner,
            'acc_partner_time' => $request->acc_partner === 'true' ? now() : null,
            'for' => $request->for,
            'acc_klien' => $request->acc_klien,
            'acc_klien_time' => $request->acc_klien === 'true' ? now() : null,
        ]);

        return redirect()->route('admin.audit.show', $auditKlien->klien)
                        ->with('success', 'Data audit berhasil diupdate.');
    }
}