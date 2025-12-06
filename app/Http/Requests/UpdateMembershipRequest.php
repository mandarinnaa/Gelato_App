<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMembershipRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'sometimes|string|max:255|unique:memberships,name,' . $this->route('membership')->id,
            'description' => 'nullable|string|max:1000',
            'price' => 'sometimes|numeric|min:0',
            'discount_percent' => 'sometimes|numeric|min:0|max:100',
            'points_multiplier' => 'sometimes|numeric|min:0',
            'min_spent' => 'sometimes|numeric|min:0',
            'benefits' => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'name.string' => 'El nombre debe ser un texto.',
            'name.max' => 'El nombre no puede exceder los 255 caracteres.',
            'name.unique' => 'Ya existe una membresía con este nombre.',
            'description.string' => 'La descripción debe ser un texto.',
            'description.max' => 'La descripción no puede exceder los 1000 caracteres.',
            'price.numeric' => 'El precio debe ser un número.',
            'price.min' => 'El precio no puede ser negativo.',
            'discount_percent.numeric' => 'El porcentaje de descuento debe ser un número.',
            'discount_percent.min' => 'El porcentaje de descuento no puede ser negativo.',
            'discount_percent.max' => 'El porcentaje de descuento no puede exceder el 100%.',
            'points_multiplier.numeric' => 'El multiplicador de puntos debe ser un número.',
            'points_multiplier.min' => 'El multiplicador de puntos no puede ser negativo.',
            'min_spent.numeric' => 'El gasto mínimo debe ser un número.',
            'min_spent.min' => 'El gasto mínimo no puede ser negativo.',
            'benefits.string' => 'Los beneficios deben ser un texto.',
        ];
    }
}