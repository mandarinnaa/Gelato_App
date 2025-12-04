<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateDriverStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'sometimes|string|max:255|unique:driver_statuses,name,' . $this->route('driverStatus')->id,
            'description' => 'nullable|string|max:1000',
        ];
    }

    public function messages(): array
    {
        return [
            'name.string' => 'El nombre debe ser un texto.',
            'name.max' => 'El nombre no puede exceder los 255 caracteres.',
            'name.unique' => 'Ya existe un estado con este nombre.',
            'description.string' => 'La descripción debe ser un texto.',
            'description.max' => 'La descripción no puede exceder los 1000 caracteres.',
        ];
    }
}