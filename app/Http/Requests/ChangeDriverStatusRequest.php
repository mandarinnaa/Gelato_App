<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ChangeDriverStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'driver_status_id' => 'required|exists:driver_statuses,id',
        ];
    }

    public function messages(): array
    {
        return [
            'driver_status_id.required' => 'El estado del repartidor es obligatorio.',
            'driver_status_id.exists' => 'El estado seleccionado no existe.',
        ];
    }
}