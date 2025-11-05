<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class ClientController extends Controller
{
    public function index()
    {
        $clients = Client::with('user')->orderBy('name')->get();

        return Inertia::render('Admin/Clients/Index', [
            'clients' => $clients,
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
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'alamat' => 'required|string|max:255',
            'kementrian' => 'required|string|max:255',
            'kode_satker' => 'required|string|max:255',
            'position' => 'nullable|string|max:255',
        ]);

        // Create user first
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'client',
            'position' => $request->position,
        ]);

        // Create client
        Client::create([
            'user_id' => $user->id,
            'name' => $request->name,
            'alamat' => $request->alamat,
            'kementrian' => $request->kementrian,
            'kode_satker' => $request->kode_satker,
        ]);

        return redirect()->route('admin.clients.index')
            ->with('success', 'Client berhasil dibuat!');
    }

    public function show(Client $client)
    {
        $client->load('user');

        return Inertia::render('Admin/Clients/Show', [
            'client' => $client,
        ]);
    }

    public function edit(Client $client)
    {
        $client->load('user');

        return Inertia::render('Admin/Clients/Edit', [
            'client' => $client,
        ]);
    }

    public function update(Request $request, Client $client)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $client->user_id,
            'alamat' => 'required|string|max:255',
            'kementrian' => 'required|string|max:255',
            'kode_satker' => 'required|string|max:255',
            'position' => 'nullable|string|max:255',
            'password' => 'nullable|string|min:8|confirmed',
        ]);

        // Update user
        $userData = [
            'name' => $request->name,
            'email' => $request->email,
            'position' => $request->position,
        ];

        if ($request->filled('password')) {
            $userData['password'] = Hash::make($request->password);
        }

        $client->user->update($userData);

        // Update client
        $client->update([
            'name' => $request->name,
            'alamat' => $request->alamat,
            'kementrian' => $request->kementrian,
            'kode_satker' => $request->kode_satker,
        ]);

        return redirect()->route('admin.clients.index')
            ->with('success', 'Client berhasil diupdate!');
    }

    public function destroy(Client $client)
    {
        // With denormalization, we can safely delete client
        // Projects will have denormalized client data and client_id will be set to null
        $client->user->delete();

        return redirect()->route('admin.clients.index')
            ->with('success', 'Client berhasil dihapus!');
    }
}
