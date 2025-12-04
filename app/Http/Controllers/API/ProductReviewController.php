<?php
// app/Http/Controllers/API/ProductReviewController.php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\ProductReview;
use App\Models\BaseProduct;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class ProductReviewController extends Controller
{
    /**
     * Obtener todas las reseñas de un producto
     */
    public function index($productId)
    {
        try {
            $reviews = ProductReview::where('base_product_id', $productId)
                ->with('user:id,name,profile_photo')
                ->orderBy('created_at', 'desc')
                ->get();

            $reviews = $reviews->map(function ($review) {
                return [
                    'id' => $review->id,
                    'rating' => (float) $review->rating,
                    'comment' => $review->comment,
                    'verified_purchase' => $review->verified_purchase,
                    'created_at' => $review->created_at->toIso8601String(),
                    'created_at_human' => $review->created_at_human,
                    'user' => [
                        'id' => $review->user->id,
                        'name' => $review->user->name,
                        'profile_photo_url' => $review->user->profile_photo_url,
                    ],
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $reviews
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error al obtener reseñas:', [
                'message' => $e->getMessage(),
                'product_id' => $productId
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al obtener las reseñas'
            ], 500);
        }
    }

    /**
     * Obtener estadísticas de rating de un producto
     */
    public function stats($productId)
    {
        try {
            $product = BaseProduct::findOrFail($productId);

            $ratingDistribution = ProductReview::where('base_product_id', $productId)
                ->select(
                    DB::raw('FLOOR(rating) as rating_floor'),
                    DB::raw('COUNT(*) as count')
                )
                ->groupBy('rating_floor')
                ->pluck('count', 'rating_floor')
                ->toArray();

            // Asegurar que todos los ratings del 1-5 tengan un valor
            $stats = [];
            for ($i = 5; $i >= 1; $i--) {
                $stats[(string)$i] = $ratingDistribution[$i] ?? 0;
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'average_rating' => (float) $product->average_rating,
                    'total_reviews' => $product->total_reviews,
                    'rating_distribution' => $stats,
                ]
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error al obtener estadísticas:', [
                'message' => $e->getMessage(),
                'product_id' => $productId
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al obtener estadísticas'
            ], 500);
        }
    }

    /**
     * Verificar si el usuario puede dejar reseña
     */
    public function canReview(Request $request, $productId)
    {
        try {
            $userId = $request->user()->id;
            
            $canReview = ProductReview::canUserReview($userId, $productId);

            return response()->json([
                'success' => true,
                'can_review' => $canReview
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error al verificar permisos de reseña:', [
                'message' => $e->getMessage(),
                'product_id' => $productId
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al verificar permisos'
            ], 500);
        }
    }

    /**
     * Crear una nueva reseña
     */
    public function store(Request $request, $productId)
    {
        $validator = Validator::make($request->all(), [
            'rating' => 'required|numeric|min:0.5|max:5',
            'comment' => 'nullable|string|max:1000',
        ], [
            'rating.required' => 'La calificación es requerida',
            'rating.min' => 'La calificación mínima es 0.5',
            'rating.max' => 'La calificación máxima es 5',
            'comment.max' => 'El comentario no puede exceder 1000 caracteres',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $userId = $request->user()->id;

            // Verificar si ya existe una reseña
            $existingReview = ProductReview::where('user_id', $userId)
                ->where('base_product_id', $productId)
                ->first();

            if ($existingReview) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ya has dejado una reseña para este producto'
                ], 400);
            }

            // Verificar si ha comprado el producto
            $orderItem = OrderItem::whereHas('order', function ($query) use ($userId) {
                $query->where('user_id', $userId)
                      ->where('delivery_status_id', 4); // Entregado
            })->where('base_product_id', $productId)
              ->first();

            DB::beginTransaction();

            $review = ProductReview::create([
                'base_product_id' => $productId,
                'user_id' => $userId,
                'order_id' => $orderItem ? $orderItem->order_id : null,
                'rating' => round($request->rating * 2) / 2, // Redondear a .0 o .5
                'comment' => $request->comment,
                'verified_purchase' => $orderItem !== null,
            ]);

            // Actualizar estadísticas del producto
            ProductReview::updateProductStats($productId);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Reseña creada exitosamente',
                'data' => $review->load('user:id,name,profile_photo')
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Error al crear reseña:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al crear la reseña'
            ], 500);
        }
    }

    /**
     * Actualizar una reseña existente
     */
    public function update(Request $request, $productId, $reviewId)
    {
        $validator = Validator::make($request->all(), [
            'rating' => 'required|numeric|min:0.5|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $review = ProductReview::where('id', $reviewId)
                ->where('base_product_id', $productId)
                ->where('user_id', $request->user()->id)
                ->firstOrFail();

            DB::beginTransaction();

            $review->update([
                'rating' => round($request->rating * 2) / 2,
                'comment' => $request->comment,
            ]);

            // Actualizar estadísticas del producto
            ProductReview::updateProductStats($productId);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Reseña actualizada exitosamente',
                'data' => $review->load('user:id,name,profile_photo')
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Error al actualizar reseña:', [
                'message' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar la reseña'
            ], 500);
        }
    }

    /**
     * Eliminar una reseña
     */
    public function destroy(Request $request, $productId, $reviewId)
    {
        try {
            $review = ProductReview::where('id', $reviewId)
                ->where('base_product_id', $productId)
                ->where('user_id', $request->user()->id)
                ->firstOrFail();

            DB::beginTransaction();

            $review->delete();

            // Actualizar estadísticas del producto
            ProductReview::updateProductStats($productId);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Reseña eliminada exitosamente'
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Error al eliminar reseña:', [
                'message' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar la reseña'
            ], 500);
        }
    }

    /**
     * Obtener la reseña del usuario actual para un producto
     */
    public function myReview(Request $request, $productId)
    {
        try {
            $review = ProductReview::where('base_product_id', $productId)
                ->where('user_id', $request->user()->id)
                ->with('user:id,name,profile_photo')
                ->first();

            if (!$review) {
                return response()->json([
                    'success' => true,
                    'data' => null
                ], 200);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $review->id,
                    'rating' => (float) $review->rating,
                    'comment' => $review->comment,
                    'verified_purchase' => $review->verified_purchase,
                    'created_at' => $review->created_at->toIso8601String(),
                    'created_at_human' => $review->created_at_human,
                ]
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error al obtener reseña del usuario:', [
                'message' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al obtener tu reseña'
            ], 500);
        }
    }
}