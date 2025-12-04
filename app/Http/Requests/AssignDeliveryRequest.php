<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AssignDeliveryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'delivery_person_id' => 'required|exists:users,id',
        ];
    }

    public function messages(): array
    {
        return [
            'delivery_person_id.required' => 'El repartidor es obligatorio.',
            'delivery_person_id.exists' => 'El repartidor seleccionado no existe.',
        ];
    }
}