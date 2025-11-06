<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;

class ClientController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $clients = Client::with('clientUsers')->paginate(10);
        
        return Inertia::render('Admin/Client/Index', [
            'clients' => $clients
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/Client/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'client_name' => 'required|string|max:255',
            'alamat' => 'required|string',
            'kementrian' => 'required|string|max:255',
            'kode_satker' => 'required|string|max:255',
        ]);

        // Create user first
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'client',
        ]);

        // Create client
        Client::create([
            'user_id' => $user->id,
            'name' => $request->client_name,
            'alamat' => $request->alamat,
            'kementrian' => $request->kementrian,
            'kode_satker' => $request->kode_satker,
        ]);

        return redirect()->route('admin.project.index')
            ->with('success', 'Klien berhasil ditambahkan.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Client $client)
    {
        $client->load('user');
        
        return Inertia::render('Admin/Client/Show', [
            'client' => $client
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Client $client)
    {
        $client->load('user');
        
        return Inertia::render('Admin/Client/Edit', [
            'client' => $client
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Client $client)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:users,email,' . $client->user_id,
            'client_name' => 'required|string|max:255',
            'alamat' => 'required|string',
            'kementrian' => 'required|string|max:255',
            'kode_satker' => 'required|string|max:255',
        ]);

        // Update user
        $client->user->update([
            'name' => $request->name,
            'email' => $request->email,
        ]);

        // Update password if provided
        if ($request->filled('password')) {
            $request->validate([
                'password' => ['confirmed', Rules\Password::defaults()],
            ]);
            
            $client->user->update([
                'password' => Hash::make($request->password),
            ]);
        }

        // Update client
        $client->update([
            'name' => $request->client_name,
            'alamat' => $request->alamat,
            'kementrian' => $request->kementrian,
            'kode_satker' => $request->kode_satker,
        ]);

        return redirect()->route('admin.project.index')
            ->with('success', 'Data klien berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Client $client)
    {
        // Delete the user as well (which will cascade to client)
        $client->user->delete();
        
        return redirect()->route('admin.project.index')
            ->with('success', 'Klien berhasil dihapus.');
    }
}
