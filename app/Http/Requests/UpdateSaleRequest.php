<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSaleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => 'nullable|exists:users,id',
            'payment_method_id' => 'sometimes|exists:payment_methods,id',
        ];
    }

    public function messages(): array
    {
        return [
            'user_id.exists' => 'El cliente seleccionado no existe.',
            'payment_method_id.exists' => 'El método de pago seleccionado no existe.',
        ];
    }
}