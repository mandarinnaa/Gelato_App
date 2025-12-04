<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMembershipRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255|unique:memberships,name',
            'description' => 'nullable|string|max:1000',
            'price' => 'required|numeric|min:0',
            'discount_percent' => 'required|numeric|min:0|max:100',
            'points_multiplier' => 'required|numeric|min:0',
            'min_spent' => 'required|numeric|min:0',
            'benefits' => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'El nombre de la membresía es obligatorio.',
            'name.string' => 'El nombre debe ser un texto.',
            'name.max' => 'El nombre no puede exceder los 255 caracteres.',
            'name.unique' => 'Ya existe una membresía con este nombre.',
            'description.string' => 'La descripción debe ser un texto.',
            'description.max' => 'La descripción no puede exceder los 1000 caracteres.',
            'price.required' => 'El precio es obligatorio.',
            'price.numeric' => 'El precio debe ser un número.',
            'price.min' => 'El precio no puede ser negativo.',
            'discount_percent.required' => 'El porcentaje de descuento es obligatorio.',
            'discount_percent.numeric' => 'El porcentaje de descuento debe ser un número.',
            'discount_percent.min' => 'El porcentaje de descuento no puede ser negativo.',
            'discount_percent.max' => 'El porcentaje de descuento no puede exceder el 100%.',
            'points_multiplier.required' => 'El multiplicador de puntos es obligatorio.',
            'points_multiplier.numeric' => 'El multiplicador de puntos debe ser un número.',
            'points_multiplier.min' => 'El multiplicador de puntos no puede ser negativo.',
            'min_spent.required' => 'El gasto mínimo es obligatorio.',
            'min_spent.numeric' => 'El gasto mínimo debe ser un número.',
            'min_spent.min' => 'El gasto mínimo no puede ser negativo.',
            'benefits.string' => 'Los beneficios deben ser un texto.',
        ];
    }
}