<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => 'required|exists:users,id',
            'address_id' => 'required|exists:addresses,id',
            'payment_method_id' => 'required|exists:payment_methods,id',
            'user_payment_card_id' => 'nullable|exists:user_payment_cards,id', // ✅ AGREGAR
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:base_products,id', // ⚠️ Cambié products a base_products
            'items.*.quantity' => 'required|integer|min:1',
            'points_used' => 'nullable|integer|min:0', // ✅ AGREGADO: Validación de puntos
        ];
    }

    public function messages(): array
    {
        return [
            'user_id.required' => 'El usuario es obligatorio.',
            'user_id.exists' => 'El usuario seleccionado no existe.',
            'address_id.required' => 'La dirección de entrega es obligatoria.',
            'address_id.exists' => 'La dirección seleccionada no existe.',
            'payment_method_id.required' => 'El método de pago es obligatorio.',
            'payment_method_id.exists' => 'El método de pago seleccionado no existe.',
            'user_payment_card_id.exists' => 'El método de pago guardado no existe.',
            'items.required' => 'Debe agregar al menos un producto al pedido.',
            'items.array' => 'Los items deben ser un arreglo.',
            'items.min' => 'Debe agregar al menos un producto al pedido.',
            'items.*.product_id.required' => 'El producto es obligatorio.',
            'items.*.product_id.exists' => 'Uno de los productos seleccionados no existe.',
            'items.*.quantity.required' => 'La cantidad es obligatoria.',
            'items.*.quantity.integer' => 'La cantidad debe ser un número entero.',
            'items.*.quantity.min' => 'La cantidad debe ser al menos 1.',
        ];
    }
}