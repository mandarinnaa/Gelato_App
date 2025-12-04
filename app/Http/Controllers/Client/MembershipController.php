<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Membership;
use Illuminate\Http\Request;

class MembershipController extends Controller
{
    /**
     * Display available memberships.
     */
    public function index()
    {
        $memberships = Membership::all();
        $currentMembership = auth()->user()->membership;

        return view('client.memberships.index', compact('memberships', 'currentMembership'));
    }

    /**
     * Show details of a specific membership.
     */
    public function show(Membership $membership)
    {
        $currentMembership = auth()->user()->membership;

        return view('client.memberships.show', compact('membership', 'currentMembership'));
    }

    /**
     * Upgrade user's membership.
     */
    public function upgrade(Request $request, Membership $membership)
    {
        $user = auth()->user();

        // Verificar si el usuario ya tiene esta membresía
        if ($user->membership_id === $membership->id) {
            return redirect()->route('client.memberships.index')
                ->with('info', 'Ya tienes esta membresía activa.');
        }

        // Aquí puedes agregar lógica de pago antes de actualizar
        // Por ejemplo: integración con Stripe, PayPal, etc.

        $user->update([
            'membership_id' => $membership->id,
        ]);

        return redirect()->route('client.memberships.index')
            ->with('success', 'Membresía actualizada exitosamente.');
    }
}