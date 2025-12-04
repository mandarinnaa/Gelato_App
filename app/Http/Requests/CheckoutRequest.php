<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'address_id' => 'required|exists:addresses,id',
            'user_payment_card_id' => 'required|exists:user_payment_cards,id',
        ];
    }

    public function messages(): array
    {
        return [
            'address_id.required' => 'La dirección de entrega es obligatoria.',
            'address_id.exists' => 'La dirección seleccionada no existe.',
            'user_payment_card_id.required' => 'Debes seleccionar un método de pago.',
            'user_payment_card_id.exists' => 'El método de pago seleccionado no existe.',
        ];
    }
}