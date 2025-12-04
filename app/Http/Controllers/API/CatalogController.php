<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Flavor;
use App\Models\Size;
use App\Models\Filling;
use App\Models\Topping;
use Illuminate\Http\Request;

class CatalogController extends Controller
{
    /**
     * Get all flavors with their base prices per size.
     */
    public function flavors()
    {
        try {
            $flavors = Flavor::available()
                ->with('basePrices')
                ->get()
                ->map(function ($flavor) {
                    // Convertir basePrices a formato { size_id: price }
                    $prices = [];
                    foreach ($flavor->basePrices as $basePrice) {
                        $prices[$basePrice->size_id] = (float) $basePrice->price;
                    }

                    return [
                        'id' => $flavor->id,
                        'name' => $flavor->name,
                        'description' => $flavor->description,
                        'available' => $flavor->available,
                        'created_at' => $flavor->created_at,
                        'updated_at' => $flavor->updated_at,
                        'prices' => $prices,
                    ];
                });
            
            return response()->json([
                'success' => true,
                'data' => $flavors
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener sabores: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all sizes.
     */
    public function sizes()
    {
        try {
            $sizes = Size::available()->get();
            
            return response()->json([
                'success' => true,
                'data' => $sizes
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener tamaños: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all fillings.
     */
    public function fillings()
    {
        try {
            $fillings = Filling::available()->get();
            
            return response()->json([
                'success' => true,
                'data' => $fillings
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener rellenos: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all toppings.
     */
    public function toppings()
    {
        try {
            $toppings = Topping::available()->get();
            
            return response()->json([
                'success' => true,
                'data' => $toppings
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener toppings: ' . $e->getMessage()
            ], 500);
        }
    }
}