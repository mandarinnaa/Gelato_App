<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\ProductCategory;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;

class CategoryController extends Controller
{
    /**
     * Display a listing of categories.
     */
    public function index()
    {
        // CAMBIO: withCount('products') → withCount('baseProducts')
        $categories = ProductCategory::withCount('baseProducts')->get();
        
        return response()->json([
            'success' => true,
            'data' => $categories
        ], 200);
    }

    /**
     * Store a newly created category.
     */
    public function store(StoreCategoryRequest $request)
    {
        $category = ProductCategory::create($request->validated());
        
        return response()->json([
            'success' => true,
            'message' => 'Categoría creada exitosamente',
            'data' => $category
        ], 201);
    }

    /**
     * Display the specified category.
     */
    public function show(ProductCategory $category)
    {
        // CAMBIO: load('products') → load('baseProducts')
        return response()->json([
            'success' => true,
            'data' => $category->load('baseProducts')
        ], 200);
    }

    /**
     * Update the specified category.
     */
    public function update(UpdateCategoryRequest $request, ProductCategory $category)
    {
        $category->update($request->validated());
        
        return response()->json([
            'success' => true,
            'message' => 'Categoría actualizada exitosamente',
            'data' => $category
        ], 200);
    }

    /**
     * Remove the specified category.
     */
    public function destroy(ProductCategory $category)
    {
        // Verificar si tiene productos base asociados
        if ($category->baseProducts()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'No se puede eliminar una categoría que tiene productos asociados'
            ], 400);
        }

        $category->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Categoría eliminada exitosamente'
        ], 200);
    }
}