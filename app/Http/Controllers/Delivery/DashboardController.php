<?php

namespace App\Http\Controllers\Delivery;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Display the delivery dashboard.
     */
    public function index()
    {
        $user = auth()->user();

        // Aquí puedes agregar lógica para mostrar pedidos asignados
        // Por ejemplo: pedidos pendientes, en ruta, completados, etc.

        return view('delivery.dashboard', compact('user'));
    }
}