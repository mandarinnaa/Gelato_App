<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use App\Mail\ContactFormMail;

class ContactController extends Controller
{
    /**
     * Enviar formulario de contacto
     */
    public function send(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:2000'
        ], [
            'name.required' => 'El nombre es requerido',
            'email.required' => 'El email es requerido',
            'email.email' => 'El email debe ser válido',
            'subject.required' => 'El asunto es requerido',
            'message.required' => 'El mensaje es requerido',
            'message.max' => 'El mensaje no puede exceder 2000 caracteres'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $contactData = $validator->validated();

            Log::info('📧 Enviando formulario de contacto', [
                'name' => $contactData['name'],
                'email' => $contactData['email'],
                'subject' => $contactData['subject']
            ]);

            // Enviar email
            Mail::to('gelatopasteleria@gmail.com')
                ->send(new ContactFormMail($contactData));

            Log::info('✅ Email de contacto enviado exitosamente', [
                'to' => 'gelatopasteleria@gmail.com',
                'from' => $contactData['email']
            ]);

            return response()->json([
                'success' => true,
                'message' => '¡Gracias por contactarnos! Te responderemos pronto.'
            ], 200);

        } catch (\Exception $e) {
            Log::error('❌ Error al enviar email de contacto', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al enviar el mensaje. Por favor intenta de nuevo.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }
}