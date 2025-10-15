<?php

namespace App\Http\Controllers;

use App\Models\Template;
use App\Models\Level;
use App\Models\SubLevel;
use App\Models\Document;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TemplateController extends Controller
{
    public function index()
    {
        $templates = Template::with(['subLevel.level', 'document'])
            ->orderBy('sub_level_id')
            ->get();

        return Inertia::render('Admin/Templates/Index', [
            'templates' => $templates,
        ]);
    }

    public function edit(Template $template)
    {
        $template->load(['subLevel.level', 'document']);
        
        return Inertia::render('Admin/Templates/Edit', [
            'template' => $template,
        ]);
    }

    public function update(Request $request, Template $template)
    {
        $request->validate([
            'document_name' => 'nullable|string|max:255',
            'file' => 'nullable|string|max:255',
            'time' => 'nullable|date',
            'comment' => 'nullable|string',
            'acc_partner' => 'required|in:false,true',
            'for' => 'required|in:kap,klien',
            'acc_klien' => 'required|in:false,true',
        ]);

        $template->update($request->all());

        return redirect()->route('templates.index')->with('success', 'Template berhasil diupdate!');
    }
}
