<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category_id' => 'required|exists:product_categories,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:2000',
            'image' => 'nullable|image|mimes:jpeg,jpg,png,webp|max:2048', // Máx 2MB
            'flavor_id' => 'required|exists:flavors,id',
            'size_id' => 'required|exists:sizes,id',
            'filling_id' => 'nullable|exists:fillings,id',
            'base_price_id' => 'required|exists:base_prices,id',
            'final_price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'available' => 'nullable|in:0,1,true,false', // Aceptar varios formatos
            'featured' => 'nullable|in:0,1,true,false', // Aceptar varios formatos
            'toppings' => 'nullable|array',
            'toppings.*' => 'exists:toppings,id',
        ];
    }

    public function messages(): array
    {
        return [
            'category_id.required' => 'La categoría es obligatoria.',
            'category_id.exists' => 'La categoría seleccionada no existe.',
            'name.required' => 'El nombre del producto es obligatorio.',
            'name.string' => 'El nombre debe ser un texto.',
            'name.max' => 'El nombre no puede exceder los 255 caracteres.',
            'description.string' => 'La descripción debe ser un texto.',
            'description.max' => 'La descripción no puede exceder los 2000 caracteres.',
            'image.image' => 'El archivo debe ser una imagen.',
            'image.mimes' => 'La imagen debe ser de tipo: jpeg, jpg, png o webp.',
            'image.max' => 'La imagen no puede pesar más de 2MB.',
            'flavor_id.required' => 'El sabor es obligatorio.',
            'flavor_id.exists' => 'El sabor seleccionado no existe.',
            'size_id.required' => 'El tamaño es obligatorio.',
            'size_id.exists' => 'El tamaño seleccionado no existe.',
            'filling_id.exists' => 'El relleno seleccionado no existe.',
            'base_price_id.required' => 'El precio base es obligatorio.',
            'base_price_id.exists' => 'El precio base seleccionado no existe.',
            'final_price.required' => 'El precio final es obligatorio.',
            'final_price.numeric' => 'El precio final debe ser un número.',
            'final_price.min' => 'El precio final no puede ser negativo.',
            'stock.required' => 'El stock es obligatorio.',
            'stock.integer' => 'El stock debe ser un número entero.',
            'stock.min' => 'El stock no puede ser negativo.',
            'available.boolean' => 'La disponibilidad debe ser verdadero o falso.',
            'featured.boolean' => 'El campo destacado debe ser verdadero o falso.',
            'toppings.array' => 'Los toppings deben ser un arreglo.',
            'toppings.*.exists' => 'Uno de los toppings seleccionados no existe.',
        ];
    }
}