<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Filling;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class FillingController extends Controller
{
    /**
     * Display a listing of fillings.
     */
    public function index(Request $request)
    {
        $query = Filling::query();
        
        // Filtro opcional por disponibilidad
        if ($request->has('available')) {
            $query->where('available', $request->boolean('available'));
        }
        
        $fillings = $query->orderBy('name')->get()->map(function ($filling) {
            return [
                'id' => $filling->id,
                'name' => $filling->name,
                'description' => $filling->description,
                'extra_price' => (float) $filling->extra_price,
                'available' => $filling->available,
                'created_at' => $filling->created_at,
                'updated_at' => $filling->updated_at,
            ];
        });
        
        return response()->json([
            'success' => true,
            'data' => $fillings
        ], 200);
    }

    /**
     * Display the specified filling.
     */
    public function show($id)
    {
        $filling = Filling::find($id);

        if (!$filling) {
            return response()->json([
                'success' => false,
                'message' => 'Relleno no encontrado'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $filling->id,
                'name' => $filling->name,
                'description' => $filling->description,
                'extra_price' => (float) $filling->extra_price,
                'available' => $filling->available,
                'created_at' => $filling->created_at,
                'updated_at' => $filling->updated_at,
            ]
        ], 200);
    }

    /**
     * Store a newly created filling.
     */
    public function store(Request $request)
    {
        Log::info('Datos recibidos en store filling:', $request->all());

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:fillings,name',
            'description' => 'nullable|string|max:1000',
            'extra_price' => 'required|numeric|min:0',
            'available' => 'nullable|in:0,1,true,false'
        ], [
            'name.required' => 'El nombre del relleno es obligatorio.',
            'name.unique' => 'Ya existe un relleno con este nombre.',
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
            
            $filling = Filling::create($data);
            
            return response()->json([
                'success' => true,
                'message' => 'Relleno creado exitosamente',
                'data' => $filling
            ], 201);
            
        } catch (\Exception $e) {
            Log::error('Error al crear relleno:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error al crear el relleno: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified filling.
     */
    public function update(Request $request, $id)
    {
        $filling = Filling::find($id);

        if (!$filling) {
            return response()->json([
                'success' => false,
                'message' => 'Relleno no encontrado'
            ], 404);
        }

        Log::info('Datos recibidos en update filling:', $request->all());

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255|unique:fillings,name,' . $id,
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
            
            $filling->update($data);
            
            return response()->json([
                'success' => true,
                'message' => 'Relleno actualizado exitosamente',
                'data' => $filling
            ], 200);
            
        } catch (\Exception $e) {
            Log::error('Error al actualizar relleno:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar el relleno: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified filling.
     */
    public function destroy($id)
    {
        $filling = Filling::find($id);

        if (!$filling) {
            return response()->json([
                'success' => false,
                'message' => 'Relleno no encontrado'
            ], 404);
        }
        
        try {
            $filling->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Relleno eliminado exitosamente'
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error al eliminar relleno:', [
                'message' => $e->getMessage(),
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar el relleno. Puede estar en uso.'
            ], 500);
        }
    }
}