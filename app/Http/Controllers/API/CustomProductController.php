<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\CustomProduct;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CustomProductController extends Controller
{
    /**
     * Lista productos personalizados del usuario autenticado que están en carrito.
     */
    public function index(Request $request)
    {
        $customProducts = CustomProduct::where('user_id', $request->user()->id)
            ->where('status', 'in_cart')
            ->with(['size', 'flavor', 'filling'])
            ->get()
            ->map(function ($product) {
                return [
                    'id' => $product->id,
                    'size' => $product->size->name,
                    'flavor' => $product->flavor->name,
                    'filling' => $product->filling ? $product->filling->name : 'Sin relleno',
                    'toppings' => $product->getToppingsDetails()->pluck('name'),
                    'final_price' => (float) $product->final_price,
                    'created_at' => $product->created_at->toDateTimeString()
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $customProducts
        ], 200);
    }

    /**
     * Crea un producto personalizado.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'size_id' => 'required|exists:sizes,id',
            'flavor_id' => 'required|exists:flavors,id',
            'filling_id' => 'nullable|exists:fillings,id',
            'toppings' => 'nullable|array',
            'toppings.*' => 'exists:toppings,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        $validated = $validator->validated();

        // Calcular precio
        $finalPrice = CustomProduct::calculatePrice(
            $validated['flavor_id'],
            $validated['size_id'],
            $validated['filling_id'] ?? null,
            $validated['toppings'] ?? []
        );

        if (!$finalPrice) {
            return response()->json([
                'success' => false,
                'message' => 'No se pudo calcular el precio. Verifica la combinación de sabor y tamaño.'
            ], 400);
        }

        $customProduct = CustomProduct::create([
            'user_id' => $request->user()->id,
            'size_id' => $validated['size_id'],
            'flavor_id' => $validated['flavor_id'],
            'filling_id' => $validated['filling_id'] ?? null,
            'toppings' => $validated['toppings'] ?? null,
            'final_price' => $finalPrice,
            'status' => 'in_cart'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Producto personalizado creado exitosamente',
            'data' => $customProduct->load(['size', 'flavor', 'filling'])
        ], 201);
    }

    /**
     * Muestra un producto personalizado específico.
     */
    public function show(Request $request, $id)
    {
        $customProduct = CustomProduct::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->with(['size', 'flavor', 'filling'])
            ->first();

        if (!$customProduct) {
            return response()->json([
                'success' => false,
                'message' => 'Producto personalizado no encontrado'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $customProduct->id,
                'size' => [
                    'id' => $customProduct->size->id,
                    'name' => $customProduct->size->name
                ],
                'flavor' => [
                    'id' => $customProduct->flavor->id,
                    'name' => $customProduct->flavor->name
                ],
                'filling' => $customProduct->filling ? [
                    'id' => $customProduct->filling->id,
                    'name' => $customProduct->filling->name
                ] : null,
                'toppings' => $customProduct->getToppingsDetails()->map(function($topping) {
                    return [
                        'id' => $topping->id,
                        'name' => $topping->name
                    ];
                }),
                'final_price' => (float) $customProduct->final_price,
                'status' => $customProduct->status,
                'created_at' => $customProduct->created_at->toDateTimeString()
            ]
        ], 200);
    }

    /**
     * Elimina un producto personalizado (solo si está en carrito).
     */
    public function destroy(Request $request, $id)
    {
        $customProduct = CustomProduct::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->where('status', 'in_cart')
            ->first();

        if (!$customProduct) {
            return response()->json([
                'success' => false,
                'message' => 'Producto personalizado no encontrado o no puede ser eliminado'
            ], 404);
        }

        $customProduct->delete();

        return response()->json([
            'success' => true,
            'message' => 'Producto personalizado eliminado exitosamente'
        ], 200);
    }

    /**
     * Calcula el precio de un producto personalizado sin crearlo.
     */
    public function calculatePrice(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'size_id' => 'required|exists:sizes,id',
            'flavor_id' => 'required|exists:flavors,id',
            'filling_id' => 'nullable|exists:fillings,id',
            'toppings' => 'nullable|array',
            'toppings.*' => 'exists:toppings,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        $validated = $validator->validated();

        $finalPrice = CustomProduct::calculatePrice(
            $validated['flavor_id'],
            $validated['size_id'],
            $validated['filling_id'] ?? null,
            $validated['toppings'] ?? []
        );

        if (!$finalPrice) {
            return response()->json([
                'success' => false,
                'message' => 'No se pudo calcular el precio. Verifica la combinación de sabor y tamaño.'
            ], 400);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'final_price' => $finalPrice
            ]
        ], 200);
    }
}