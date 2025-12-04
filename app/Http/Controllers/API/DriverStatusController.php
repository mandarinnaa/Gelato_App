<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\DriverStatus;
use App\Http\Requests\StoreDriverStatusRequest;
use App\Http\Requests\UpdateDriverStatusRequest;
use App\Http\Requests\ChangeDriverStatusRequest;
use Illuminate\Http\Request;

class DriverStatusController extends Controller
{
    /**
     * Display a listing of driver statuses.
     */
    public function index()
    {
        $statuses = DriverStatus::withCount('drivers')->get();
        
        return response()->json([
            'success' => true,
            'data' => $statuses
        ], 200);
    }

    /**
     * Store a newly created driver status.
     */
    public function store(StoreDriverStatusRequest $request)
    {
        $status = DriverStatus::create($request->validated());
        
        return response()->json([
            'success' => true,
            'message' => 'Estado de repartidor creado exitosamente',
            'data' => $status
        ], 201);
    }

    /**
     * Display the specified driver status.
     */
    public function show(DriverStatus $driverStatus)
    {
        return response()->json([
            'success' => true,
            'data' => $driverStatus->load('drivers')
        ], 200);
    }

    /**
     * Update the specified driver status.
     */
    public function update(UpdateDriverStatusRequest $request, DriverStatus $driverStatus)
    {
        $driverStatus->update($request->validated());
        
        return response()->json([
            'success' => true,
            'message' => 'Estado de repartidor actualizado exitosamente',
            'data' => $driverStatus
        ], 200);
    }

    /**
     * Change authenticated driver's status.
     */
    public function changeStatus(ChangeDriverStatusRequest $request)
    {
        $user = $request->user();
        
        if (!$user->isDelivery()) {
            return response()->json([
                'success' => false,
                'message' => 'Solo el personal de entrega puede cambiar el estado de repartidor'
            ], 403);
        }

        $user->update(['driver_status_id' => $request->driver_status_id]);
        
        return response()->json([
            'success' => true,
            'message' => 'Estado de repartidor cambiado exitosamente',
            'data' => $user->fresh()->load('driverStatus')
        ], 200);
    }

    /**
     * Remove the specified driver status.
     */
    public function destroy(DriverStatus $driverStatus)
    {
        if ($driverStatus->drivers()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'No se puede eliminar un estado con repartidores asignados'
            ], 400);
        }

        $driverStatus->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Estado de repartidor eliminado exitosamente'
        ], 200);
    }
}