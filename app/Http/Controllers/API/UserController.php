<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Display a listing of users.
     */
    public function index()
    {
        $users = User::with(['role', 'membership'])->paginate(15);
        
        return response()->json([
            'success' => true,
            'data' => $users
        ], 200);
    }

    /**
     * Store a newly created user.
     */
    public function store(StoreUserRequest $request)
    {
        $data = [
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'role_id' => $request->role_id,
            'membership_id' => $request->membership_id,
            'points' => 0,
        ];

        // Manejar la subida de la foto de perfil
        if ($request->hasFile('profile_photo')) {
            $data['profile_photo'] = $request->file('profile_photo')->store('profile_photos');
        }
        
        $user = User::create($data);
        
        return response()->json([
            'success' => true,
            'message' => 'Usuario creado exitosamente',
            'data' => $user->load('role', 'membership')
        ], 201);
    }

    /**
     * Display the specified user.
     */
    public function show(User $user)
    {
        return response()->json([
            'success' => true,
            'data' => $user->load(['role', 'membership', 'addresses'])
        ], 200);
    }

    /**
     * Update the specified user.
     */
    public function update(UpdateUserRequest $request, User $user)
    {
        $data = $request->validated();
        
        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }

        // Manejar la actualización de la foto de perfil
        if ($request->hasFile('profile_photo')) {
            // Eliminar la foto anterior si existe
            if ($user->profile_photo) {
                Storage::disk()->delete($user->profile_photo);
            }
            
            $data['profile_photo'] = $request->file('profile_photo')->store('profile_photos');
        }
        
        $user->update($data);
        
        return response()->json([
            'success' => true,
            'message' => 'Usuario actualizado exitosamente',
            'data' => $user->load('role', 'membership')
        ], 200);
    }

    /**
     * Remove the specified user.
     */
    public function destroy(User $user)
    {
        // Eliminar la foto de perfil si existe
        if ($user->profile_photo) {
            Storage::disk()->delete($user->profile_photo);
        }

        $user->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Usuario eliminado exitosamente'
        ], 200);
    }

    /**
     * Update user's profile photo.
     */
    public function updateProfilePhoto(Request $request, User $user)
    {
        $request->validate([
            'profile_photo' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        // Eliminar la foto anterior si existe
        if ($user->profile_photo) {
            Storage::disk()->delete($user->profile_photo);
        }

        $path = $request->file('profile_photo')->store('profile_photos');
        $user->update(['profile_photo' => $path]);

        return response()->json([
            'success' => true,
            'message' => 'Foto de perfil actualizada exitosamente',
            'data' => $user,
            'profile_photo_url' => $user->profile_photo_url
        ], 200);
    }

    /**
     * Delete user's profile photo.
     */
    public function deleteProfilePhoto(User $user)
    {
        if ($user->profile_photo) {
            Storage::disk()->delete($user->profile_photo);
            $user->update(['profile_photo' => null]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Foto de perfil eliminada exitosamente'
        ], 200);
    }

    /**
     * Update user's phone number.
     */
    public function updatePhone(Request $request, User $user)
    {
        try {
            // Validar que el usuario autenticado sea el propietario o un admin
            if (auth()->id() !== $user->id && !auth()->user()->hasAnyRole(['admin', 'superadmin'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'No tienes permiso para actualizar este usuario'
                ], 403);
            }

            // Validación del teléfono
            $validator = Validator::make($request->all(), [
                'phone' => 'required|string|regex:/^[0-9]{10}$/|unique:users,phone,' . $user->id,
            ], [
                'phone.required' => 'El número de teléfono es requerido',
                'phone.regex' => 'El número de teléfono debe tener 10 dígitos',
                'phone.unique' => 'Este número de teléfono ya está registrado',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Actualizar el teléfono
            $user->phone = $request->phone;
            $user->save();

            return response()->json([
                'success' => true,
                'message' => 'Número de teléfono actualizado exitosamente',
                'phone' => $user->phone,
                'data' => $user->load('role', 'membership')
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar el teléfono',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}