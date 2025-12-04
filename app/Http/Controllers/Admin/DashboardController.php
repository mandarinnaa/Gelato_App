<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Display the admin dashboard.
     */
    public function index()
    {
        $totalUsers = User::count();
        $totalClients = User::whereHas('role', function($query) {
            $query->where('name', 'cliente');
        })->count();
        $totalDelivery = User::whereHas('role', function($query) {
            $query->where('name', 'repartidor');
        })->count();
        $totalAdmins = User::whereHas('role', function($query) {
            $query->whereIn('name', ['admin', 'superadmin']);
        })->count();

        return view('admin.dashboard', compact(
            'totalUsers',
            'totalClients',
            'totalDelivery',
            'totalAdmins'
        ));
    }
}