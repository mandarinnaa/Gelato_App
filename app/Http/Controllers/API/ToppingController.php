<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Topping;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class ToppingController extends Controller
{
    /**
     * Display a listing of toppings.
     */
    public function index(Request $request)
    {
        $query = Topping::query();
        
        // Filtro opcional por disponibilidad
        if ($request->has('available')) {
            $query->where('available', $request->boolean('available'));
        }
        
        $toppings = $query->orderBy('name')->get()->map(function ($topping) {
            return [
                'id' => $topping->id,
                'name' => $topping->name,
                'description' => $topping->description,
                'extra_price' => (float) $topping->extra_price,
                'available' => $topping->available,
                'created_at' => $topping->created_at,
                'updated_at' => $topping->updated_at,
            ];
        });
        
        return response()->json([
            'success' => true,
            'data' => $toppings
        ], 200);
    }

    /**
     * Display the specified topping.
     */
    public function show($id)
    {
        $topping = Topping::find($id);

        if (!$topping) {
            return response()->json([
                'success' => false,
                'message' => 'Topping no encontrado'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $topping->id,
                'name' => $topping->name,
                'description' => $topping->description,
                'extra_price' => (float) $topping->extra_price,
                'available' => $topping->available,
                'created_at' => $topping->created_at,
                'updated_at' => $topping->updated_at,
            ]
        ], 200);
    }

    /**
     * Store a newly created topping.
     */
    public function store(Request $request)
    {
        Log::info('Datos recibidos en store topping:', $request->all());

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:toppings,name',
            'description' => 'nullable|string|max:1000',
            'extra_price' => 'required|numeric|min:0',
            'available' => 'nullable|in:0,1,true,false'
        ], [
            'name.required' => 'El nombre del topping es obligatorio.',
            'name.unique' => 'Ya existe un topping con este nombre.',
            'name.max' => 'El nombre no puede exceder los 255 caracteres.',
            'description.max' => 'La descripción no puede exceder los 1000 caracteres.',
            'extra_price.required' => 'El precio extra es obligatorio.',
            'extra_price.numeric' => 'El precio extra debe ser un número.',
            'extra_price.min' => 'El precio extra no puede ser negativo.',
        ]);

        if ($validator->fails()) {
            Log::error('Validación fallida:', $validator->errors()->toArray());
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $data = $validator->validated();
            
            // Asegurar que extra_price es numérico
            $data['extra_price'] = (float) $data['extra_price'];
            
            // Convertir booleano correctamente
            $data['available'] = filter_var($request->input('available', true), FILTER_VALIDATE_BOOLEAN);
            
            Log::info('Datos a insertar:', $data);
            
            $topping = Topping::create($data);
            
            return response()->json([
                'success' => true,
                'message' => 'Topping creado exitosamente',
                'data' => $topping
            ], 201);
            
        } catch (\Exception $e) {
            Log::error('Error al crear topping:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error al crear el topping: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified topping.
     */
    public function update(Request $request, $id)
    {
        $topping = Topping::find($id);

        if (!$topping) {
            return response()->json([
                'success' => false,
                'message' => 'Topping no encontrado'
            ], 404);
        }

        Log::info('Datos recibidos en update topping:', $request->all());

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255|unique:toppings,name,' . $id,
            'description' => 'nullable|string|max:1000',
            'extra_price' => 'sometimes|numeric|min:0',
            'available' => 'nullable|in:0,1,true,false'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $data = $validator->validated();
            
            // Convertir extra_price si existe
            if (isset($data['extra_price'])) {
                $data['extra_price'] = (float) $data['extra_price'];
            }
            
            // Convertir booleano correctamente
            if ($request->has('available')) {
                $data['available'] = filter_var($request->input('available'), FILTER_VALIDATE_BOOLEAN);
            }
            
            $topping->update($data);
            
            return response()->json([
                'success' => true,
                'message' => 'Topping actualizado exitosamente',
                'data' => $topping
            ], 200);
            
        } catch (\Exception $e) {
            Log::error('Error al actualizar topping:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar el topping: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified topping.
     */
    public function destroy($id)
    {
        $topping = Topping::find($id);

        if (!$topping) {
            return response()->json([
                'success' => false,
                'message' => 'Topping no encontrado'
            ], 404);
        }
        
        try {
            $topping->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Topping eliminado exitosamente'
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error al eliminar topping:', [
                'message' => $e->getMessage(),
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar el topping. Puede estar en uso.'
            ], 500);
        }
    }
}