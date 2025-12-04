<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Membership;
use Illuminate\Http\Request;

class MembershipController extends Controller
{
    /**
     * Display a listing of memberships.
     */
    public function index()
    {
        $memberships = Membership::withCount('users')->get();

        return view('admin.memberships.index', compact('memberships'));
    }

    /**
     * Show the form for creating a new membership.
     */
    public function create()
    {
        return view('admin.memberships.create');
    }

    /**
     * Store a newly created membership in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:memberships'],
            'price' => ['required', 'numeric', 'min:0', 'max:999999.99'],
            'discount_percent' => ['required', 'numeric', 'min:0', 'max:100'],
            'points_multiplier' => ['required', 'numeric', 'min:0', 'max:999.99'],
            'min_spent' => ['required', 'numeric', 'min:0', 'max:999999.99'],
        ]);

        Membership::create($validated);

        return redirect()->route('admin.memberships.index')
            ->with('success', 'Membresía creada exitosamente.');
    }

    /**
     * Display the specified membership.
     */
    public function show(Membership $membership)
    {
        $membership->loadCount('users');
        $users = $membership->users()->paginate(10);

        return view('admin.memberships.show', compact('membership', 'users'));
    }

    /**
     * Show the form for editing the specified membership.
     */
    public function edit(Membership $membership)
    {
        return view('admin.memberships.edit', compact('membership'));
    }

    /**
     * Update the specified membership in storage.
     */
    public function update(Request $request, Membership $membership)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:memberships,name,' . $membership->id],
            'price' => ['required', 'numeric', 'min:0', 'max:999999.99'],
            'discount_percent' => ['required', 'numeric', 'min:0', 'max:100'],
            'points_multiplier' => ['required', 'numeric', 'min:0', 'max:999.99'],
            'min_spent' => ['required', 'numeric', 'min:0', 'max:999999.99'],
        ]);

        $membership->update($validated);

        return redirect()->route('admin.memberships.index')
            ->with('success', 'Membresía actualizada exitosamente.');
    }

    /**
     * Remove the specified membership from storage.
     */
    public function destroy(Membership $membership)
    {
        // Set membership_id to null for users with this membership
        $membership->users()->update(['membership_id' => null]);

        $membership->delete();

        return redirect()->route('admin.memberships.index')
            ->with('success', 'Membresía eliminada exitosamente.');
    }
}