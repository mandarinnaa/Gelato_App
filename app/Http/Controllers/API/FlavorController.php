<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Flavor;
use App\Models\Size;
use App\Models\BasePrice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class FlavorController extends Controller
{
    public function index()
    {
        $flavors = Flavor::with(['basePrices.size'])->get()->map(function ($flavor) {
            return [
                'id' => $flavor->id,
                'name' => $flavor->name,
                'description' => $flavor->description,
                'available' => $flavor->available,
                'created_at' => $flavor->created_at,
                'prices' => $flavor->basePrices->mapWithKeys(function ($bp) {
                    return [$bp->size_id => (float) $bp->price];
                }),
            ];
        });

        return response()->json(['success' => true, 'data' => $flavors]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:flavors,name',
            'description' => 'nullable|string',
            'available' => 'boolean',
            'prices' => 'required|array',
            'prices.*' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $flavor = Flavor::create([
                'name' => $request->name,
                'description' => $request->description,
                'available' => $request->available ?? true,
            ]);

            // Crear base_prices para cada tamaño
            foreach ($request->prices as $sizeId => $price) {
                BasePrice::create([
                    'flavor_id' => $flavor->id,
                    'size_id' => $sizeId,
                    'price' => $price,
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Sabor creado exitosamente',
                'data' => $flavor->load('basePrices.size')
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al crear el sabor: ' . $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $flavor = Flavor::find($id);

        if (!$flavor) {
            return response()->json([
                'success' => false,
                'message' => 'Sabor no encontrado'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:flavors,name,' . $id,
            'description' => 'nullable|string',
            'available' => 'boolean',
            'prices' => 'required|array',
            'prices.*' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $flavor->update([
                'name' => $request->name,
                'description' => $request->description,
                'available' => $request->available ?? true,
            ]);

            // Actualizar o crear base_prices
            foreach ($request->prices as $sizeId => $price) {
                BasePrice::updateOrCreate(
                    ['flavor_id' => $flavor->id, 'size_id' => $sizeId],
                    ['price' => $price]
                );
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Sabor actualizado exitosamente',
                'data' => $flavor->load('basePrices.size')
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        $flavor = Flavor::find($id);

        if (!$flavor) {
            return response()->json([
                'success' => false,
                'message' => 'Sabor no encontrado'
            ], 404);
        }

        try {
            DB::beginTransaction();
            
            // Eliminar base_prices asociados
            BasePrice::where('flavor_id', $id)->delete();
            $flavor->delete();
            
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Sabor eliminado exitosamente'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar: ' . $e->getMessage()
            ], 500);
        }
    }
}