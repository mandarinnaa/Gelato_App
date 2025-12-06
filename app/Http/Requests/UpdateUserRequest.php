<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:users,email,' . $this->route('user')->id,
            'password' => 'sometimes|string|min:8',
            'phone' => 'nullable|string|max:20',
            'profile_photo' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'role_id' => 'sometimes|exists:roles,id',
            'membership_id' => 'nullable|exists:memberships,id',
            'points' => 'sometimes|integer|min:0',
            'driver_status_id' => 'nullable|exists:driver_statuses,id',
        ];
    }

    public function messages(): array
    {
        return [
            'name.string' => 'El nombre debe ser un texto.',
            'name.max' => 'El nombre no puede exceder los 255 caracteres.',
            
            'email.email' => 'Debe proporcionar un correo electrónico válido.',
            'email.unique' => 'Este correo electrónico ya está registrado.',
            'email.max' => 'El correo electrónico no puede exceder los 255 caracteres.',
            
            'password.min' => 'La contraseña debe tener al menos 8 caracteres.',
            
            'phone.string' => 'El teléfono debe ser un texto.',
            'phone.max' => 'El teléfono no puede exceder los 20 caracteres.',
            
            'profile_photo.image' => 'El archivo debe ser una imagen.',
            'profile_photo.mimes' => 'La foto de perfil debe ser un archivo de tipo: jpeg, png, jpg, gif o webp.',
            'profile_photo.max' => 'La foto de perfil no puede pesar más de 2MB.',
            
            'role_id.exists' => 'El rol seleccionado no existe.',
            
            'membership_id.exists' => 'La membresía seleccionada no existe.',
            
            'points.integer' => 'Los puntos deben ser un número entero.',
            'points.min' => 'Los puntos no pueden ser negativos.',
            
            'driver_status_id.exists' => 'El estado de conductor seleccionado no existe.',
        ];
    }
}