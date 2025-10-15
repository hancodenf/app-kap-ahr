<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PartnerController extends Controller
{
    public function dashboard()
    {
        return Inertia::render('Partner/Dashboard', [
            'user' => Auth::user()->load('role'),
        ]);
    }
}
