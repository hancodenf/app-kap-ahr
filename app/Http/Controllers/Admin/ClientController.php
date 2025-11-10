<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ClientController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->get('search', '');

        $clients = Client::withCount(['clientUsers', 'projects']) // Count related user accounts and projects
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('alamat', 'like', "%{$search}%")
                        ->orWhere('kementrian', 'like', "%{$search}%")
                        ->orWhere('kode_satker', 'like', "%{$search}%");
                });
            })
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Clients/Index', [
            'clients' => $clients,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Clients/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'alamat' => 'required|string|max:255',
            'kementrian' => 'required|string|max:255',
            'kode_satker' => 'required|string|max:255',
        ]);

        // Generate unique slug from name
        $slug = Str::slug($request->name);
        $originalSlug = $slug;
        $counter = 1;
        
        // Ensure slug is unique
        while (Client::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }

        // Create client
        Client::create([
            'name' => $request->name,
            'slug' => $slug,
            'alamat' => $request->alamat,
            'kementrian' => $request->kementrian,
            'kode_satker' => $request->kode_satker,
        ]);

        return redirect()->route('admin.clients.index')
            ->with('success', 'Client berhasil dibuat!');
    }

    public function show(Client $client)
    {
        $client->load([
            'clientUsers',
            'projects' => function ($query) {
                $query->withCount(['workingSteps', 'tasks'])
                    ->orderBy('created_at', 'desc');
            }
        ]);

        return Inertia::render('Admin/Clients/Show', [
            'client' => $client,
        ]);
    }

    public function edit(Client $client)
    {
        return Inertia::render('Admin/Clients/Edit', [
            'client' => $client,
        ]);
    }

    public function update(Request $request, Client $client)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'alamat' => 'required|string|max:255',
            'kementrian' => 'required|string|max:255',
            'kode_satker' => 'required|string|max:255',
        ]);

        // Generate new slug if name changed
        $updateData = [
            'name' => $request->name,
            'alamat' => $request->alamat,
            'kementrian' => $request->kementrian,
            'kode_satker' => $request->kode_satker,
        ];

        // If name changed, regenerate slug
        if ($request->name !== $client->name) {
            $slug = Str::slug($request->name);
            $originalSlug = $slug;
            $counter = 1;
            
            // Ensure slug is unique (excluding current client)
            while (Client::where('slug', $slug)->where('id', '!=', $client->id)->exists()) {
                $slug = $originalSlug . '-' . $counter;
                $counter++;
            }
            
            $updateData['slug'] = $slug;
        }

        // Update client
        $client->update($updateData);

        return redirect()->route('admin.clients.index')
            ->with('success', 'Client berhasil diupdate!');
    }

    public function destroy(Client $client)
    {
        // Load relationship counts
        $client->loadCount(['clientUsers', 'projects']);

        // Check if client has related users or projects
        if ($client->client_users_count > 0 || $client->projects_count > 0) {
            $messages = [];
            
            if ($client->client_users_count > 0) {
                $messages[] = "{$client->client_users_count} akun user";
            }
            
            if ($client->projects_count > 0) {
                $messages[] = "{$client->projects_count} project";
            }
            
            $errorMessage = "Client tidak dapat dihapus karena masih memiliki " . implode(' dan ', $messages) . " yang terkait. Silakan hapus atau pindahkan data terkait terlebih dahulu.";
            
            return redirect()->route('admin.clients.index')
                ->with('error', $errorMessage);
        }

        // Delete client if no relations exist
        $client->delete();

        return redirect()->route('admin.clients.index')
            ->with('success', 'Client berhasil dihapus!');
    }
}
