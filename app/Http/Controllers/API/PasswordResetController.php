<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;


class PasswordResetController extends Controller
{
    /**
     * Enviar email de reseteo de contraseña
     * Funciona para usuarios normales Y usuarios de Google
     */
    public function sendResetLink(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email'
        ], [
            'email.exists' => 'No existe una cuenta con este correo electrónico'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        Log::info('🔐 Solicitud de reseteo de contraseña:', [
            'email' => $request->email,
            'user_id' => $user->id,
            'has_google_photo' => filter_var($user->profile_photo, FILTER_VALIDATE_URL)
        ]);

        // Enviar link de reseteo (funciona igual para todos los usuarios)
        $status = Password::sendResetLink(
            $request->only('email')
        );

        if ($status === Password::RESET_LINK_SENT) {
            Log::info('✅ Email de reseteo enviado exitosamente', [
                'email' => $request->email
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Te hemos enviado un correo con las instrucciones para restablecer tu contraseña'
            ], 200);
        }

        Log::error('❌ Error al enviar email de reseteo', [
            'email' => $request->email,
            'status' => $status
        ]);

        return response()->json([
            'success' => false,
            'message' => 'No se pudo enviar el correo de restablecimiento. Inténtalo de nuevo.'
        ], 500);
    }

    /**
     * Resetear la contraseña
     * Permite a usuarios de Google crear su primera contraseña
     */
    public function reset(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|min:8|confirmed',
        ], [
            'password.min' => 'La contraseña debe tener al menos 8 caracteres',
            'password.confirmed' => 'Las contraseñas no coinciden'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill([
                    'password' => Hash::make($password)
                ])->setRememberToken(Str::random(60));

                $user->save();

                event(new PasswordReset($user));

                Log::info('✅ Contraseña restablecida exitosamente', [
                    'user_id' => $user->id,
                    'email' => $user->email,
                    'had_google_photo' => filter_var($user->profile_photo, FILTER_VALIDATE_URL)
                ]);
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json([
                'success' => true,
                'message' => 'Tu contraseña ha sido restablecida exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.'
            ], 200);
        }

        Log::error('❌ Error al resetear contraseña', [
            'email' => $request->email,
            'status' => $status
        ]);

        return response()->json([
            'success' => false,
            'message' => $this->getResetErrorMessage($status)
        ], 400);
    }

    /**
     * Verificar si el token de reseteo es válido
     */
    public function verifyToken(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'token' => 'required',
            'email' => 'required|email'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Token o email inválido'
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Usuario no encontrado'
            ], 404);
        }

        // Verificar si el token es válido
        $tokenExists = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$tokenExists) {
            return response()->json([
                'success' => false,
                'message' => 'Token inválido o expirado'
            ], 400);
        }

        // Verificar si el token hash coincide
        if (!Hash::check($request->token, $tokenExists->token)) {
            return response()->json([
                'success' => false,
                'message' => 'Token inválido'
            ], 400);
        }

        // Verificar si no ha expirado (60 minutos por defecto)
        $expiration = config('auth.passwords.users.expire', 60);
        $tokenCreatedAt = \Carbon\Carbon::parse($tokenExists->created_at);
        
        if ($tokenCreatedAt->addMinutes($expiration)->isPast()) {
            return response()->json([
                'success' => false,
                'message' => 'El token ha expirado. Solicita uno nuevo.'
            ], 400);
        }

        return response()->json([
            'success' => true,
            'message' => 'Token válido',
            'data' => [
                'email' => $user->email,
                'is_google_user' => filter_var($user->profile_photo, FILTER_VALIDATE_URL)
            ]
        ], 200);
    }

    /**
     * Obtener mensaje de error amigable
     */
private function getResetErrorMessage($status)
{
    return match($status) {
        Password::INVALID_TOKEN => 'El token de restablecimiento es inválido. Solicita uno nuevo.',
        Password::INVALID_USER => 'No se encontró ningún usuario con este correo electrónico.',
        'passwords.throttled' => 'Por favor espera antes de intentar de nuevo.',
        default => 'No se pudo restablecer la contraseña. Inténtalo de nuevo.'
    };
}

}