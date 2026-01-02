<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class StaffController extends Controller
{
    public function dashboard()
    {
        return Inertia::render('Staff/Dashboard', [
            'user' => Auth::user(),
        ]);
    }
}
