<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'delivery_person_id' => 'nullable|exists:users,id',
            'address_id' => 'sometimes|exists:addresses,id',
            'payment_method_id' => 'sometimes|exists:payment_methods,id',
        ];
    }

    public function messages(): array
    {
        return [
            'delivery_person_id.exists' => 'El repartidor seleccionado no existe.',
            'address_id.exists' => 'La dirección seleccionada no existe.',
            'payment_method_id.exists' => 'El método de pago seleccionado no existe.',
        ];
    }
}