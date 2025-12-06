<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Display the client dashboard.
     */
    public function index()
    {
        $user = auth()->user();
        $user->load('membership');

        // Aquí puedes agregar más lógica para el dashboard del cliente
        // Por ejemplo: últimos pedidos, productos favoritos, etc.

        return view('client.dashboard', compact('user'));
    }
}