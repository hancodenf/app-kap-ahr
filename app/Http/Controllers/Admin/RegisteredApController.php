<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\RegisteredAp;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class RegisteredApController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->input('search', '');
        $status = $request->input('status', '');

        $query = RegisteredAp::with('user:id,name,email,position');

        // Search filter
        if ($search) {
            $query->search($search);
        }

        // Status filter
        if ($status) {
            $query->where('status', $status);
        }

        $registeredAps = $query->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString()
            ->through(fn($ap) => [
                'id' => $ap->id,
                'user_id' => $ap->user_id,
                'user_name' => $ap->user->name ?? 'N/A',
                'user_email' => $ap->user->email ?? 'N/A',
                'user_position' => $ap->user->position ?? '-',
                'ap_number' => $ap->ap_number,
                'registration_date' => $ap->registration_date?->format('Y-m-d'),
                'formatted_registration_date' => $ap->formatted_registration_date,
                'expiry_date' => $ap->expiry_date?->format('Y-m-d'),
                'formatted_expiry_date' => $ap->formatted_expiry_date,
                'status' => $ap->status,
                'status_color' => $ap->status_color,
                'is_expired' => $ap->isExpired(),
                'created_at' => $ap->created_at->format('Y-m-d H:i:s'),
            ]);

        // Count by status
        $statusCounts = [
            'active' => RegisteredAp::where('status', 'active')->count(),
            'inactive' => RegisteredAp::where('status', 'inactive')->count(),
            'expired' => RegisteredAp::where('status', 'expired')->count(),
        ];

        return Inertia::render('Admin/RegisteredAps/Index', [
            'registeredAps' => $registeredAps,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
            'statusCounts' => $statusCounts,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // Get users who don't have registered AP yet
        $availableUsers = User::whereDoesntHave('registeredAp')
            ->where('role', 'company') // Only company role users can have AP
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'position']);

        return Inertia::render('Admin/RegisteredAps/Create', [
            'availableUsers' => $availableUsers,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id|unique:registered_aps,user_id',
            'ap_number' => 'required|string|max:255|unique:registered_aps,ap_number',
            'registration_date' => 'required|date',
            'expiry_date' => 'nullable|date|after:registration_date',
            'status' => 'required|in:active,inactive,expired',
        ]);

        RegisteredAp::create($validated);

        return redirect()->route('admin.registered-aps.index')
            ->with('success', 'Registered AP created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(RegisteredAp $registeredAp)
    {
        $registeredAp->load('user:id,name,email,position,created_at');

        return Inertia::render('Admin/RegisteredAps/Show', [
            'registeredAp' => [
                'id' => $registeredAp->id,
                'user_id' => $registeredAp->user_id,
                'user' => [
                    'id' => $registeredAp->user->id,
                    'name' => $registeredAp->user->name,
                    'email' => $registeredAp->user->email,
                    'position' => $registeredAp->user->position ?? '-',
                    'created_at' => $registeredAp->user->created_at->format('d M Y'),
                ],
                'ap_number' => $registeredAp->ap_number,
                'registration_date' => $registeredAp->registration_date?->format('Y-m-d'),
                'formatted_registration_date' => $registeredAp->formatted_registration_date,
                'expiry_date' => $registeredAp->expiry_date?->format('Y-m-d'),
                'formatted_expiry_date' => $registeredAp->formatted_expiry_date,
                'status' => $registeredAp->status,
                'status_color' => $registeredAp->status_color,
                'is_expired' => $registeredAp->isExpired(),
                'created_at' => $registeredAp->created_at->format('d M Y H:i'),
                'updated_at' => $registeredAp->updated_at->format('d M Y H:i'),
            ],
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(RegisteredAp $registeredAp)
    {
        $registeredAp->load('user:id,name,email,position');

        // Get all company users for dropdown (including current user)
        $availableUsers = User::where('role', 'company')
            ->where(function($query) use ($registeredAp) {
                $query->whereDoesntHave('registeredAp')
                      ->orWhere('id', $registeredAp->user_id);
            })
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'position']);

        return Inertia::render('Admin/RegisteredAps/Edit', [
            'registeredAp' => [
                'id' => $registeredAp->id,
                'user_id' => $registeredAp->user_id,
                'user' => [
                    'id' => $registeredAp->user->id,
                    'name' => $registeredAp->user->name,
                    'email' => $registeredAp->user->email,
                    'position' => $registeredAp->user->position ?? '-',
                ],
                'ap_number' => $registeredAp->ap_number,
                'registration_date' => $registeredAp->registration_date?->format('Y-m-d'),
                'expiry_date' => $registeredAp->expiry_date?->format('Y-m-d'),
                'status' => $registeredAp->status,
            ],
            'availableUsers' => $availableUsers,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, RegisteredAp $registeredAp)
    {
        $validated = $request->validate([
            'ap_number' => 'required|string|max:255|unique:registered_aps,ap_number,' . $registeredAp->id,
            'registration_date' => 'required|date',
            'expiry_date' => 'nullable|date|after:registration_date',
            'status' => 'required|in:active,inactive,expired',
        ]);

        $registeredAp->update($validated);

        return redirect()->route('admin.registered-aps.index')
            ->with('success', 'Registered AP updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(RegisteredAp $registeredAp)
    {
        $registeredAp->delete();

        return redirect()->route('admin.registered-aps.index')
            ->with('success', 'Registered AP deleted successfully.');
    }
}
