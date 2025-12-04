<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Http\Requests\StoreRoleRequest;
use App\Http\Requests\UpdateRoleRequest;

class RoleController extends Controller
{
    /**
     * Display a listing of roles.
     */
    public function index()
    {
        $roles = Role::withCount('users')->get();
        
        return response()->json([
            'success' => true,
            'data' => $roles
        ], 200);
    }

    /**
     * Store a newly created role.
     */
    public function store(StoreRoleRequest $request)
    {
        $role = Role::create($request->validated());
        
        return response()->json([
            'success' => true,
            'message' => 'Rol creado exitosamente',
            'data' => $role
        ], 201);
    }

    /**
     * Display the specified role.
     */
    public function show(Role $role)
    {
        return response()->json([
            'success' => true,
            'data' => $role->load('users')
        ], 200);
    }

    /**
     * Update the specified role.
     */
    public function update(UpdateRoleRequest $request, Role $role)
    {
        $role->update($request->validated());
        
        return response()->json([
            'success' => true,
            'message' => 'Rol actualizado exitosamente',
            'data' => $role
        ], 200);
    }

    /**
     * Remove the specified role.
     */
    public function destroy(Role $role)
    {
        if ($role->users()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'No se puede eliminar un rol con usuarios asignados'
            ], 400);
        }

        $role->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Rol eliminado exitosamente'
        ], 200);
    }
}