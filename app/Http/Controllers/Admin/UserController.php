<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $users = User::when($request->search, function ($query, $search) {
            $query->where('name', 'like', '%' . $search . '%')
                ->orWhere('email', 'like', '%' . $search . '%')
                ->orWhere('role', 'like', '%' . $search . '%');
        })
            ->where('id', '!=', Auth::id())
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        // Transform data to match frontend expectations
        $users->getCollection()->transform(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'position' => $user->position ?? null,
                'user_type' => $user->user_type ?? null,
                'role' => [
                    'name' => $user->role,
                    'display_name' => ucfirst($user->role),
                ],
                'email_verified_at' => $user->email_verified_at,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
            ];
        });

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $roles = [
            ['id' => 'admin', 'name' => 'admin', 'display_name' => 'Administrator'],
            ['id' => 'client', 'name' => 'client', 'display_name' => 'Client'],
            ['id' => 'company', 'name' => 'company', 'display_name' => 'Company'],
        ];

        $positions = [
            'Founder - Partner',
            'Managing Partner',
            'Partner',
            'Associates Manager',
            'Tenaga Ahli - Supervisor',
            'Senior Auditor',
            'Junior Auditor',
            'Internship Auditor',
            'Internship Finance',
            'Support',
            'Internship HR',
        ];

        $userTypes = [
            'Tenaga Ahli',
            'Staff',
        ];

        // Get all clients with their primary user
        $clients = Client::with('user:id,name')->orderBy('name')->get()->map(function($client) {
            return [
                'id' => $client->user_id,
                'name' => $client->name,
            ];
        });

        return Inertia::render('Admin/Users/Create', [
            'roles' => $roles,
            'positions' => $positions,
            'userTypes' => $userTypes,
            'clients' => $clients,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $rules = [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role_id' => 'required|in:admin,client,company',
        ];

        // Add position and user_type validation only for company role
        if ($request->role_id === 'company') {
            $rules['position'] = 'required|in:Founder - Partner,Managing Partner,Partner,Associates Manager,Tenaga Ahli - Supervisor,Senior Auditor,Junior Auditor,Internship Auditor,Internship Finance,Support,Internship HR';
            $rules['user_type'] = 'required|in:Tenaga Ahli,Staff';
        }

        // Add client_id validation for client role
        if ($request->role_id === 'client') {
            $rules['client_id'] = 'required|exists:users,id';
        }

        $request->validate($rules);

        $userData = [
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role_id,
            'email_verified_at' => now(), // Auto verify untuk admin created users
        ];

        // Set position and user_type based on role
        if ($request->role_id === 'company') {
            $userData['position'] = $request->position;
            $userData['user_type'] = $request->user_type;
        } elseif ($request->role_id === 'admin') {
            $userData['position'] = null;
            $userData['user_type'] = 'Staff';
        } else { // client
            $userData['position'] = null;
            $userData['user_type'] = null;
            $userData['client_id'] = $request->client_id;
        }

        User::create($userData);

        return redirect()->route('admin.users.index')
            ->with('success', 'User berhasil dibuat.');
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {
        // Transform user data to match frontend expectations
        $userData = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'position' => $user->position ?? null,
            'user_type' => $user->user_type ?? null,
            'role' => [
                'id' => $user->role,
                'name' => $user->role,
                'display_name' => ucfirst($user->role),
            ],
            'email_verified_at' => $user->email_verified_at,
            'created_at' => $user->created_at,
            'updated_at' => $user->updated_at,
        ];

        return Inertia::render('Admin/Users/Show', [
            'user' => $userData,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $user)
    {
        $roles = [
            ['id' => 'admin', 'name' => 'admin', 'display_name' => 'Administrator'],
            ['id' => 'client', 'name' => 'client', 'display_name' => 'Client'],
            ['id' => 'company', 'name' => 'company', 'display_name' => 'Company'],
        ];

        $positions = [
            'Founder - Partner',
            'Managing Partner',
            'Partner',
            'Associates Manager',
            'Tenaga Ahli - Supervisor',
            'Senior Auditor',
            'Junior Auditor',
            'Internship Auditor',
            'Internship Finance',
            'Support',
            'Internship HR',
        ];

        $userTypes = [
            'Tenaga Ahli',
            'Staff',
        ];

        // Get all clients with their primary user
        $clients = Client::with('user:id,name')->orderBy('name')->get()->map(function($client) {
            return [
                'id' => $client->user_id,
                'name' => $client->name,
            ];
        });

        // Transform user data to match frontend expectations
        $userData = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'position' => $user->position ?? null,
            'user_type' => $user->user_type ?? null,
            'client_id' => $user->client_id ?? null,
            'role' => [
                'id' => $user->role,
                'name' => $user->role,
                'display_name' => ucfirst($user->role),
            ],
            'email_verified_at' => $user->email_verified_at,
            'created_at' => $user->created_at,
            'updated_at' => $user->updated_at,
        ];

        return Inertia::render('Admin/Users/Edit', [
            'user' => $userData,
            'roles' => $roles,
            'positions' => $positions,
            'userTypes' => $userTypes,
            'clients' => $clients,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user)
    {
        $rules = [
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => 'nullable|string|min:8|confirmed',
            'role_id' => 'required|in:admin,client,company',
        ];

        // Add position and user_type validation only for company role
        if ($request->role_id === 'company') {
            $rules['position'] = 'required|in:Founder - Partner,Managing Partner,Partner,Associates Manager,Tenaga Ahli - Supervisor,Senior Auditor,Junior Auditor,Internship Auditor,Internship Finance,Support,Internship HR';
            $rules['user_type'] = 'required|in:Tenaga Ahli,Staff';
        }

        // Add client_id validation for client role
        if ($request->role_id === 'client') {
            $rules['client_id'] = 'required|exists:users,id';
        }

        $request->validate($rules);

        $userData = [
            'name' => $request->name,
            'email' => $request->email,
            'role' => $request->role_id,
        ];

        // Set position and user_type based on role
        if ($request->role_id === 'company') {
            $userData['position'] = $request->position;
            $userData['user_type'] = $request->user_type;
            $userData['client_id'] = null;
        } elseif ($request->role_id === 'admin') {
            $userData['position'] = null;
            $userData['user_type'] = 'Staff';
            $userData['client_id'] = null;
        } else { // client
            $userData['position'] = null;
            $userData['user_type'] = null;
            $userData['client_id'] = $request->client_id;
        }

        // Only update password if provided
        if ($request->filled('password')) {
            $userData['password'] = Hash::make($request->password);
        }

        $user->update($userData);

        return redirect()->route('admin.users.index')
            ->with('success', 'User berhasil diupdate.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        // Prevent admin from deleting themselves
        if ($user->id === Auth::id()) {
            return redirect()->back()
                ->with('error', 'Anda tidak bisa menghapus akun sendiri.');
        }

        $user->delete();

        return redirect()->route('admin.users.index')
            ->with('success', 'User berhasil dihapus.');
    }
}
