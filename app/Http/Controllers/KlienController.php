<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class KlienController extends Controller
{
    public function dashboard()
    {
        return Inertia::render('Klien/Dashboard', [
            'user' => Auth::user()->load('role'),
        ]);
    }
}
