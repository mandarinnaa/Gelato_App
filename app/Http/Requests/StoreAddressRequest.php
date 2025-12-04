<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAddressRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => 'required|exists:users,id',
            'title' => 'required|string|max:255',
            'street' => 'required|string|max:255',
            'number' => 'required|string|max:50',
            'neighborhood' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'state' => 'required|string|max:255',
            'postal_code' => 'required|string|max:10',
            'reference' => 'nullable|string|max:500',
            'is_default' => 'nullable|boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'user_id.required' => 'El usuario es obligatorio.',
            'user_id.exists' => 'El usuario seleccionado no existe.',
            'title.required' => 'El título de la dirección es obligatorio.',
            'title.string' => 'El título debe ser un texto.',
            'title.max' => 'El título no puede exceder los 255 caracteres.',
            'street.required' => 'La calle es obligatoria.',
            'street.string' => 'La calle debe ser un texto.',
            'street.max' => 'La calle no puede exceder los 255 caracteres.',
            'number.required' => 'El número es obligatorio.',
            'number.string' => 'El número debe ser un texto.',
            'number.max' => 'El número no puede exceder los 50 caracteres.',
            'neighborhood.required' => 'La colonia es obligatoria.',
            'neighborhood.string' => 'La colonia debe ser un texto.',
            'neighborhood.max' => 'La colonia no puede exceder los 255 caracteres.',
            'city.required' => 'La ciudad es obligatoria.',
            'city.string' => 'La ciudad debe ser un texto.',
            'city.max' => 'La ciudad no puede exceder los 255 caracteres.',
            'state.required' => 'El estado es obligatorio.',
            'state.string' => 'El estado debe ser un texto.',
            'state.max' => 'El estado no puede exceder los 255 caracteres.',
            'postal_code.required' => 'El código postal es obligatorio.',
            'postal_code.string' => 'El código postal debe ser un texto.',
            'postal_code.max' => 'El código postal no puede exceder los 10 caracteres.',
            'reference.string' => 'La referencia debe ser un texto.',
            'reference.max' => 'La referencia no puede exceder los 500 caracteres.',
            'is_default.boolean' => 'El campo dirección predeterminada debe ser verdadero o falso.',
        ];
    }
}