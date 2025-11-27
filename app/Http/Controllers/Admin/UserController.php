<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Client;
use App\Exports\UsersExport;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Default role filter to 'admin' if not specified
        $roleFilter = $request->role ?? 'admin';
        
        $users = User::with('belongsToClient:id,name')
            ->withCount(['projectTeams', 'activityLogs', 'registeredAp'])
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', '%' . $search . '%')
                    ->orWhere('email', 'like', '%' . $search . '%')
                    ->orWhere('role', 'like', '%' . $search . '%');
            })
            ->where('role', $roleFilter)
            ->where('id', '!=', Auth::id())
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        // Transform data to match frontend expectations
        $users->getCollection()->transform(function ($user) use ($roleFilter) {
            $data = [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'profile_photo' => $user->profile_photo ?? null,
                'position' => $user->position ?? null,
                'user_type' => $user->user_type ?? null,
                'client_id' => $user->client_id ?? null,
                'client_name' => $user->belongsToClient?->name ?? null,
                'whatsapp' => $user->whatsapp ?? null,
                'is_active' => $user->is_active,
                'role' => [
                    'name' => $user->role,
                    'display_name' => ucfirst($user->role),
                ],
                'email_verified_at' => $user->email_verified_at,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
                // Add relation counts
                'project_teams_count' => $user->project_teams_count ?? 0,
                'activity_logs_count' => $user->activity_logs_count ?? 0,
                'registered_ap_count' => $user->registered_ap_count ?? 0,
            ];
            
            return $data;
        });

        // Get role counts for tabs
        $roleCounts = [
            'admin' => User::where('role', 'admin')->where('id', '!=', Auth::id())->count(),
            'company' => User::where('role', 'company')->where('id', '!=', Auth::id())->count(),
            'client' => User::where('role', 'client')->where('id', '!=', Auth::id())->count(),
        ];

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'filters' => [
                'search' => $request->search,
                'role' => $roleFilter,
            ],
            'roleCounts' => $roleCounts,
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

        // Get all clients
        $clients = Client::orderBy('name')->get()->map(function($client) {
            return [
                'id' => $client->id,
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
            'profile_photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'whatsapp' => ['nullable', 'string', 'max:20', 'unique:users,whatsapp'],
        ];

        // Add position and user_type validation only for company role
        if ($request->role_id === 'company') {
            $rules['position'] = 'required|in:Founder - Partner,Managing Partner,Partner,Associates Manager,Tenaga Ahli - Supervisor,Senior Auditor,Junior Auditor,Internship Auditor,Internship Finance,Support,Internship HR';
            $rules['user_type'] = 'required|in:Tenaga Ahli,Staff';
        }

        // Add client_id validation for client role
        if ($request->role_id === 'client') {
            $rules['client_id'] = 'required|exists:clients,id';
        }

        $request->validate($rules);

        $userData = [
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role_id,
            'email_verified_at' => now(), // Auto verify untuk admin created users
            'whatsapp' => $request->whatsapp,
        ];

        // Handle profile photo upload
        if ($request->hasFile('profile_photo')) {
            $file = $request->file('profile_photo');
            $filename = time() . '_' . $file->getClientOriginalName();
            $file->storeAs('profile_photos', $filename, 'public');
            $userData['profile_photo'] = 'profile_photos/' . $filename;
        }

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

        return redirect()->route('admin.users.index', ['role' => $request->role_id])
            ->with('success', 'User berhasil dibuat.');
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {
        // Load all relations with their data
        $user->load([
            'projectTeams' => function($query) {
                $query->orderBy('created_at', 'desc')->limit(10);
            },
            'projectTeams.project',
            'activityLogs' => function($query) {
                $query->orderBy('created_at', 'desc')->limit(20);
            },
            'registeredAp',
            'belongsToClient'
        ]);

        // Transform user data to match frontend expectations
        $userData = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'profile_photo' => $user->profile_photo ?? null,
            'position' => $user->position ?? null,
            'user_type' => $user->user_type ?? null,
            'client_id' => $user->client_id ?? null,
            'client_name' => $user->belongsToClient?->name ?? null,
            'whatsapp' => $user->whatsapp ?? null,
            'role' => [
                'id' => $user->role,
                'name' => $user->role,
                'display_name' => ucfirst($user->role),
            ],
            'email_verified_at' => $user->email_verified_at,
            'created_at' => $user->created_at,
            'updated_at' => $user->updated_at,
            
            // Relations data
            'project_teams' => $user->projectTeams->map(function($team) {
                return [
                    'id' => $team->id,
                    'project_id' => $team->project_id,
                    'project_name' => $team->project_name,
                    'project_client_name' => $team->project_client_name,
                    'role' => $team->role,
                    'user_position' => $team->user_position,
                    'created_at' => $team->created_at,
                ];
            }),
            'activity_logs' => $user->activityLogs->map(function($log) {
                return [
                    'id' => $log->id,
                    'action_type' => $log->action_type,
                    'action' => $log->action,
                    'target_name' => $log->target_name,
                    'description' => $log->description,
                    'created_at' => $log->created_at,
                ];
            }),
            'registered_ap' => $user->registeredAp ? [
                'id' => $user->registeredAp->id,
                'ap_number' => $user->registeredAp->ap_number,
                'registration_date' => $user->registeredAp->registration_date,
                'expiry_date' => $user->registeredAp->expiry_date,
                'status' => $user->registeredAp->status,
                'created_at' => $user->registeredAp->created_at,
            ] : null,

            // Counts
            'project_teams_count' => $user->projectTeams->count(),
            'activity_logs_count' => $user->activityLogs->count(),
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

        // Get all clients
        $clients = Client::orderBy('name')->get()->map(function($client) {
            return [
                'id' => $client->id,
                'name' => $client->name,
            ];
        });

        // Transform user data to match frontend expectations
        $userData = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'profile_photo' => $user->profile_photo ?? null,
            'position' => $user->position ?? null,
            'user_type' => $user->user_type ?? null,
            'client_id' => $user->client_id ?? null,
            'whatsapp' => $user->whatsapp ?? null,
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
            'profile_photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'whatsapp' => ['nullable', 'string', 'max:20', Rule::unique('users', 'whatsapp')->ignore($user->id)],
        ];

        // Add position and user_type validation only for company role
        if ($request->role_id === 'company') {
            $rules['position'] = 'required|in:Founder - Partner,Managing Partner,Partner,Associates Manager,Tenaga Ahli - Supervisor,Senior Auditor,Junior Auditor,Internship Auditor,Internship Finance,Support,Internship HR';
            $rules['user_type'] = 'required|in:Tenaga Ahli,Staff';
        }

        // Add client_id validation for client role
        if ($request->role_id === 'client') {
            $rules['client_id'] = 'required|exists:clients,id';
        }

        $request->validate($rules);

        $userData = [
            'name' => $request->name,
            'email' => $request->email,
            'role' => $request->role_id,
            'whatsapp' => $request->whatsapp,
        ];

        // Handle profile photo upload
        if ($request->hasFile('profile_photo')) {
            // Delete old photo if exists
            if ($user->profile_photo) {
                Storage::disk('public')->delete($user->profile_photo);
            }
            
            $file = $request->file('profile_photo');
            $filename = time() . '_' . $file->getClientOriginalName();
            $file->storeAs('profile_photos', $filename, 'public');
            $userData['profile_photo'] = 'profile_photos/' . $filename;
        }

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

        return redirect()->route('admin.users.index', ['role' => $request->role_id])
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

        // Load relationship counts
        $user->loadCount(['projectTeams', 'activityLogs', 'registeredAp']);

        // Check if user has related data
        if ($user->project_teams_count > 0 || $user->activity_logs_count > 0 || $user->registered_ap_count > 0) {
            $messages = [];
            
            if ($user->project_teams_count > 0) {
                $messages[] = "{$user->project_teams_count} project team";
            }
            
            if ($user->activity_logs_count > 0) {
                $messages[] = "{$user->activity_logs_count} activity log";
            }

            if ($user->registered_ap_count > 0) {
                $messages[] = "registrasi AP";
            }
            
            $errorMessage = "User tidak dapat dihapus karena masih memiliki " . implode(', ', $messages) . " yang terkait.\n\nSilakan hapus atau pindahkan data terkait terlebih dahulu.";
            
            return redirect()->route('admin.users.index')
                ->with('error', $errorMessage);
        }

        // Delete profile photo if exists
        $role = $user->role;
        if ($user->profile_photo) {
            Storage::disk('public')->delete($user->profile_photo);
        }

        $user->delete();

        return redirect()->route('admin.users.index', ['role' => $role])
            ->with('success', 'User berhasil dihapus.');
    }

    /**
     * Toggle user active status.
     */
    public function toggleStatus(User $user)
    {
        // Prevent admin from deactivating themselves
        if ($user->id === Auth::id()) {
            return redirect()->back()
                ->with('error', 'Anda tidak bisa menonaktifkan akun sendiri.');
        }

        $user->is_active = !$user->is_active;
        $user->save();

        $status = $user->is_active ? 'diaktifkan' : 'dinonaktifkan';

        return redirect()->back()
            ->with('success', "User {$user->name} berhasil {$status}.");
    }

    /**
     * Export users to Excel
     */
    public function export(Request $request)
    {
        $role = $request->role ?? null;
        $search = $request->search ?? null;

        $filename = 'users_export_' . now()->format('Y-m-d_His') . '.xlsx';

        return Excel::download(new UsersExport($role, $search), $filename);
    }
}
