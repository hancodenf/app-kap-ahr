<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class StaffController extends Controller
{
    public function dashboard()
    {
        return Inertia::render('Staff/Dashboard', [
            'user' => Auth::user()->load('role'),
        ]);
    }
}
