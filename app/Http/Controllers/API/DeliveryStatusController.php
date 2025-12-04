<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\DeliveryStatus;
use App\Http\Requests\StoreDeliveryStatusRequest;
use App\Http\Requests\UpdateDeliveryStatusRequest;

class DeliveryStatusController extends Controller
{
    /**
     * Display a listing of delivery statuses.
     */
    public function index()
    {
        $statuses = DeliveryStatus::withCount('orders')->get();
        
        return response()->json([
            'success' => true,
            'data' => $statuses
        ], 200);
    }

    /**
     * Store a newly created delivery status.
     */
    public function store(StoreDeliveryStatusRequest $request)
    {
        $status = DeliveryStatus::create($request->validated());
        
        return response()->json([
            'success' => true,
            'message' => 'Estado de entrega creado exitosamente',
            'data' => $status
        ], 201);
    }

    /**
     * Display the specified delivery status.
     */
    public function show(DeliveryStatus $deliveryStatus)
    {
        return response()->json([
            'success' => true,
            'data' => $deliveryStatus->load('orders')
        ], 200);
    }

    /**
     * Update the specified delivery status.
     */
    public function update(UpdateDeliveryStatusRequest $request, DeliveryStatus $deliveryStatus)
    {
        $deliveryStatus->update($request->validated());
        
        return response()->json([
            'success' => true,
            'message' => 'Estado de entrega actualizado exitosamente',
            'data' => $deliveryStatus
        ], 200);
    }

    /**
     * Remove the specified delivery status.
     */
    public function destroy(DeliveryStatus $deliveryStatus)
    {
        if ($deliveryStatus->orders()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'No se puede eliminar un estado de entrega con pedidos asociados'
            ], 400);
        }

        $deliveryStatus->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Estado de entrega eliminado exitosamente'
        ], 200);
    }
}