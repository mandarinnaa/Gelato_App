<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Role;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\LoginRequest;
use Illuminate\Http\Request;
use Kreait\Firebase\Factory;

use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    /**
     * Register a new user
     */
    public function register(RegisterRequest $request)
    {
        // Obtener rol de cliente por defecto
        $clientRole = Role::where('name', 'cliente')->first();
        
        if (!$clientRole) {
            return response()->json([
                'success' => false,
                'message' => 'Rol de cliente no encontrado. Por favor ejecute los seeders.'
            ], 500);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'role_id' => $clientRole->id,
            'membership_id' => null,
            'points' => 0,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        // Cargar relaciones
        $user->load('role', 'membership');

        Log::info('Usuario registrado:', [
            'user_id' => $user->id,
            'email' => $user->email,
            'role' => $user->role->name,
            'has_membership' => !!$user->membership
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Usuario registrado exitosamente',
            'data' => [
                'user' => $user,
                'token' => $token,
                'token_type' => 'Bearer'
            ]
        ], 201);
    }

    /**
     * Login user
     */
    public function login(LoginRequest $request)
    {
        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Credenciales inválidas'
            ], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        // Cargar relaciones - CRÍTICO para membresías
        $user->load('role', 'membership');

        Log::info('Usuario inició sesión:', [
            'user_id' => $user->id,
            'email' => $user->email,
            'role' => $user->role->name,
            'has_membership' => !!$user->membership,
            'membership_name' => $user->membership?->name,
            'membership_discount' => $user->membership?->discount_percent
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Inicio de sesión exitoso',
            'data' => [
                'user' => $user,
                'token' => $token,
                'token_type' => 'Bearer'
            ]
        ], 200);
    }

    /**
     * Logout user (revoke token)
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Sesión cerrada exitosamente'
        ], 200);
    }

    /**
     * Get authenticated user info
     */
    public function me(Request $request)
    {
        // Obtener usuario con relaciones
        $user = $request->user();
        $user->load('role', 'membership', 'addresses');

        Log::info('Usuario solicitó información actual:', [
            'user_id' => $user->id,
            'email' => $user->email,
            'has_membership' => !!$user->membership,
            'membership_id' => $user->membership_id,
            'membership_details' => $user->membership ? [
                'name' => $user->membership->name,
                'discount_percent' => $user->membership->discount_percent,
                'points_multiplier' => $user->membership->points_multiplier
            ] : null
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'user' => $user
            ]
        ], 200);
    }

      /**
     * ✅ NUEVO: Login/Register con Google usando Firebase
     */
    public function googleAuth(Request $request)
    {
        try {
            $request->validate([
                'id_token' => 'required|string',
                'email' => 'required|email',
                'name' => 'required|string',
                'profile_photo' => 'nullable|url'
            ]);

            // 1. Verificar el token con Firebase
            $factory = (new Factory())
                ->withServiceAccount([
                    'type' => 'service_account',
                    'project_id' => config('services.firebase.project_id'),
                    'client_email' => config('services.firebase.client_email'),
                    'private_key' => str_replace('\\n', "\n", config('services.firebase.private_key')),
                ]);

            $auth = $factory->createAuth();
            
            try {
                $verifiedIdToken = $auth->verifyIdToken($request->id_token);
            } catch (\Exception $e) {
                Log::error('❌ Error verificando token de Firebase:', [
                    'error' => $e->getMessage()
                ]);
                
                return response()->json([
                    'success' => false,
                    'message' => 'Token de Firebase inválido'
                ], 401);
            }

            $firebaseUid = $verifiedIdToken->claims()->get('sub');
            $email = $request->email;

            Log::info('🔥 Token de Firebase verificado:', [
                'firebase_uid' => $firebaseUid,
                'email' => $email
            ]);

            // 2. Buscar o crear usuario
            $user = User::where('email', $email)->first();

            if (!$user) {
                // Crear nuevo usuario
                $clientRole = Role::where('name', 'cliente')->first();
                
                if (!$clientRole) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Rol de cliente no encontrado'
                    ], 500);
                }

                $user = User::create([
                    'name' => $request->name,
                    'email' => $email,
                    'password' => bcrypt(uniqid()), // Password aleatorio (no se usará)
                    'profile_photo' => $request->profile_photo,
                    'role_id' => $clientRole->id,
                    'membership_id' => null,
                    'points' => 0,
                    'email_verified_at' => now() // Auto-verificado por Google
                ]);

                Log::info('✅ Nuevo usuario creado con Google:', [
                    'user_id' => $user->id,
                    'email' => $user->email
                ]);
            } else {
                // Actualizar foto de perfil si cambió
                if ($request->profile_photo && $user->profile_photo !== $request->profile_photo) {
                    $user->update(['profile_photo' => $request->profile_photo]);
                }

                Log::info('👤 Usuario existente autenticado con Google:', [
                    'user_id' => $user->id,
                    'email' => $user->email
                ]);
            }

            // 3. Crear token de Sanctum
            $token = $user->createToken('auth_token')->plainTextToken;

            // 4. Cargar relaciones
            $user->load('role', 'membership');

            Log::info('🎉 Login con Google exitoso:', [
                'user_id' => $user->id,
                'email' => $user->email,
                'role' => $user->role->name,
                'has_membership' => !!$user->membership
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Autenticación con Google exitosa',
                'data' => [
                    'user' => $user,
                    'token' => $token,
                    'token_type' => 'Bearer'
                ]
            ], 200);

        } catch (\Exception $e) {
            Log::error('❌ Error en googleAuth:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al autenticar con Google',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
