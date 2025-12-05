<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\BaseProduct;
use App\Models\BaseProductImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Schema;

use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class BaseProductController extends Controller
{
    private function applyMembershipDiscount($price, $user)
    {
        if (!$user || !$user->membership) {
            return $price;
        }

        $discountPercent = floatval($user->membership->discount_percent ?? 0);
        $discount = ($price * $discountPercent) / 100;
        
        return $price - $discount;
    }

    private function formatProductWithDiscount($product, $user = null)
    {
        $finalPrice = floatval($product->final_price);
        $discountedPrice = $this->applyMembershipDiscount($finalPrice, $user);
        $discountPercent = $user && $user->membership ? floatval($user->membership->discount_percent) : 0;
        
        return [
            'id' => $product->id,
            'name' => $product->name,
            'description' => $product->description,
            'images' => $product->image_urls, // Array de imágenes
            'image' => $product->image_url, // Imagen principal (compatibilidad)
            'flavor' => [
                'id' => $product->flavor->id,
                'name' => $product->flavor->name
            ],
            'category' => [
                'id' => $product->category->id,
                'name' => $product->category->name
            ],
            'original_price' => $finalPrice,
            'final_price' => $discountedPrice,
            'discount_applied' => $discountPercent,
            'has_discount' => $finalPrice > $discountedPrice,
            'available' => $product->available,
            'featured' => $product->featured,
            'stock' => $product->stock,
            'average_rating' => floatval($product->average_rating),
            'total_reviews' => intval($product->total_reviews),
            'sold_count' => intval($product->sale_items_count ?? 0),
        ];
    }

    public function index(Request $request)
    {
        Log::info('📦 BaseProductController@index - Iniciando');
        
        try {
            // Verificar si la tabla base_product_images existe
            $hasImagesTable = Schema::hasTable('base_product_images');
            
            if ($hasImagesTable) {
                $query = BaseProduct::with(['category', 'flavor', 'images'])->withCount('saleItems');
            } else {
                $query = BaseProduct::with(['category', 'flavor'])->withCount('saleItems');
            }
            
            if ($request->has('category_id')) {
                $query->where('category_id', $request->category_id);
            }
            
            if ($request->has('available')) {
                $query->where('available', $request->boolean('available'));
            }
            
            if ($request->has('featured')) {
                $query->where('featured', $request->boolean('featured'));
            }
            
            $products = $query->get();
            
            $user = null;
            if ($request->user()) {
                $user = $request->user()->load('membership');
            }
            
            $formattedProducts = $products->map(function ($product) use ($user) {
                return $this->formatProductWithDiscount($product, $user);
            });
            
            return response()->json([
                'success' => true,
                'data' => $formattedProducts,
                'membership_info' => $user && $user->membership ? [
                    'name' => $user->membership->name,
                    'discount_percent' => floatval($user->membership->discount_percent),
                    'points_multiplier' => floatval($user->membership->points_multiplier)
                ] : null
            ], 200);
        } catch (\Exception $e) {
            Log::error('🔥 Error CRÍTICO en BaseProductController@index:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(), // Agregamos archivo
                'line' => $e->getLine(), // Agregamos línea
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener productos: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show(Request $request, $id)
    {
        $product = BaseProduct::with(['category', 'flavor', 'images'])->find($id);
        
        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Producto no encontrado'
            ], 404);
        }

        $user = null;
        if ($request->user()) {
            $user = $request->user()->load('membership');
        }
        
        $productData = $this->formatProductWithDiscount($product, $user);
        $productData['available_sizes'] = $product->getAvailableSizes();
        
        return response()->json([
            'success' => true,
            'data' => $productData,
            'membership_info' => $user && $user->membership ? [
                'name' => $user->membership->name,
                'discount_percent' => floatval($user->membership->discount_percent),
                'points_multiplier' => floatval($user->membership->points_multiplier)
            ] : null
        ], 200);
    }

    public function store(Request $request)
    {
        Log::info('Datos recibidos en store:', $request->all());

        $validator = Validator::make($request->all(), [
            'category_id' => 'required|exists:product_categories,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:2000',
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'flavor_id' => 'required|exists:flavors,id',
            'final_price' => 'required|numeric|min:0',
            'stock' => 'nullable|integer|min:0',
            'available' => 'nullable|in:0,1,true,false',
            'featured' => 'nullable|in:0,1,true,false',
            'primary_image_index' => 'nullable|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $data = $validator->validated();
            $data['final_price'] = floatval($data['final_price']);
            $data['available'] = filter_var($request->input('available', true), FILTER_VALIDATE_BOOLEAN);
            $data['featured'] = filter_var($request->input('featured', false), FILTER_VALIDATE_BOOLEAN);
            
            // Crear el producto
            $product = BaseProduct::create($data);
            
            // Procesar imágenes
            if ($request->hasFile('images')) {
                $primaryIndex = $request->input('primary_image_index', 0);
                $images = $request->file('images');
                
                foreach ($images as $index => $image) {
                    $imagePath = $image->store('products');
                    
                    BaseProductImage::create([
                        'base_product_id' => $product->id,
                        'image_path' => $imagePath,
                        'order' => $index,
                        'is_primary' => $index == $primaryIndex,
                    ]);
                }
            }
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'Producto base creado exitosamente',
                'data' => $product->load(['category', 'flavor', 'images'])
            ], 201);
            
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al crear producto:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error al crear el producto: ' . $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $product = BaseProduct::find($id);
        
        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Producto no encontrado'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'category_id' => 'sometimes|exists:product_categories,id',
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string|max:2000',
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'flavor_id' => 'sometimes|exists:flavors,id',
            'final_price' => 'sometimes|numeric|min:0',
            'stock' => 'nullable|integer|min:0',
            'available' => 'nullable|in:0,1,true,false',
            'featured' => 'nullable|in:0,1,true,false',
            'primary_image_index' => 'nullable|integer|min:0',
            'delete_images' => 'nullable|array',
            'delete_images.*' => 'integer|exists:base_product_images,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $data = $validator->validated();
            
            if (isset($data['final_price'])) {
                $data['final_price'] = floatval($data['final_price']);
            }
            
            if ($request->has('available')) {
                $data['available'] = filter_var($request->input('available'), FILTER_VALIDATE_BOOLEAN);
            }
            
            if ($request->has('featured')) {
                $data['featured'] = filter_var($request->input('featured'), FILTER_VALIDATE_BOOLEAN);
            }
            
            // Eliminar imágenes marcadas
            if ($request->has('delete_images')) {
                $imagesToDelete = BaseProductImage::whereIn('id', $request->delete_images)
                    ->where('base_product_id', $product->id)
                    ->get();
                
                foreach ($imagesToDelete as $imageRecord) {
                    Storage::disk()->delete($imageRecord->image_path);
                    $imageRecord->delete();
                }
            }
            
            // Agregar nuevas imágenes
            if ($request->hasFile('images')) {
                $currentMaxOrder = $product->images()->max('order') ?? -1;
                $primaryIndex = $request->input('primary_image_index', null);
                $images = $request->file('images');
                
                // Si se especifica una nueva imagen principal, desmarcar las anteriores
                if ($primaryIndex !== null) {
                    $product->images()->update(['is_primary' => false]);
                }
                
                foreach ($images as $index => $image) {
                    $imagePath = $image->store('products');
                    
                    BaseProductImage::create([
                        'base_product_id' => $product->id,
                        'image_path' => $imagePath,
                        'order' => $currentMaxOrder + $index + 1,
                        'is_primary' => $primaryIndex !== null && $index == $primaryIndex,
                    ]);
                }
            }
            
            // Actualizar datos del producto
            unset($data['images'], $data['delete_images'], $data['primary_image_index']);
            $product->update($data);
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'Producto base actualizado exitosamente',
                'data' => $product->load(['category', 'flavor', 'images'])
            ], 200);
            
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al actualizar producto:', [
                'message' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar el producto: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        $product = BaseProduct::with('images')->find($id);
        
        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Producto no encontrado'
            ], 404);
        }

        try {
            DB::beginTransaction();

            // Eliminar todas las imágenes
            foreach ($product->images as $image) {
                Storage::disk()->delete($image->image_path);
                $image->delete();
            }
            
            // Eliminar imagen antigua si existe
            if ($product->image) {
                Storage::disk()->delete($product->image);
            }
            
            $product->delete();
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'Producto base eliminado exitosamente'
            ], 200);
            
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al eliminar producto:', [
                'message' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar el producto: ' . $e->getMessage()
            ], 500);
        }
    }
}