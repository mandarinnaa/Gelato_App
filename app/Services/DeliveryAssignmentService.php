<?php

namespace App\Services;

use App\Models\User;
use App\Models\Order;
use App\Models\DeliveryStatus;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class DeliveryAssignmentService
{
    /**
     * Asigna automáticamente un repartidor disponible a una orden
     * usando load balancing basado en pedidos activos
     * 
     * @param Order $order
     * @return User|null El repartidor asignado o null si no hay disponibles
     */
    public function assignDeliveryPerson(Order $order): ?User
    {
        try {
            // Obtener IDs de estados activos (pendiente, preparando, en_camino)
            $activeStatusIds = DeliveryStatus::whereIn('name', [
                'pendiente',
                'preparando', 
                'en_camino'
            ])->pluck('id');

            // Buscar repartidores disponibles con su carga de trabajo
            // Nota: Usamos 'deliveries' porque así se llama la relación en el modelo User
            $deliveryPerson = User::whereHas('role', function($query) {
                    $query->where('name', 'repartidor');
                })
                ->whereHas('driverStatus', function($query) {
                    $query->where('name', 'disponible');
                })
                ->withCount([
                    'deliveries' => function ($query) use ($activeStatusIds) {
                        $query->whereIn('delivery_status_id', $activeStatusIds);
                    }
                ])
                ->orderBy('deliveries_count', 'asc') // El que tenga menos pedidos activos
                ->orderBy('created_at', 'asc') // En caso de empate, el más antiguo
                ->first();

            if (!$deliveryPerson) {
                Log::warning('⚠️ No hay repartidores disponibles', [
                    'order_id' => $order->id
                ]);
                return null;
            }

            // Asignar el repartidor a la orden
            $order->update([
                'delivery_person_id' => $deliveryPerson->id
            ]);

            // Registrar en el historial
            $order->statusHistory()->create([
                'delivery_status_id' => $order->delivery_status_id,
                'changed_by' => $order->user_id,
                'notes' => "Repartidor asignado automáticamente: {$deliveryPerson->name}"
            ]);

            Log::info('✅ Repartidor asignado automáticamente', [
                'order_id' => $order->id,
                'delivery_person_id' => $deliveryPerson->id,
                'delivery_person_name' => $deliveryPerson->name,
                'active_orders_count' => $deliveryPerson->deliveries_count
            ]);

            // Emitir evento de asignación
            try {
                \App\Events\OrderAssigned::dispatch($order);
            } catch (\Exception $e) {
                Log::error('Error broadcasting OrderAssigned event: ' . $e->getMessage());
            }

            return $deliveryPerson;

        } catch (\Exception $e) {
            Log::error('❌ Error al asignar repartidor automáticamente', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return null;
        }
    }

    /**
     * Reasigna un pedido a otro repartidor en caso de ser necesario
     * 
     * @param Order $order
     * @param int|null $excludeDeliveryPersonId ID del repartidor a excluir
     * @return User|null
     */
    public function reassignDeliveryPerson(Order $order, ?int $excludeDeliveryPersonId = null): ?User
    {
        try {
            $activeStatusIds = DeliveryStatus::whereIn('name', [
                'pendiente',
                'preparando',
                'en_camino'
            ])->pluck('id');

            $query = User::whereHas('role', function($q) {
                    $q->where('name', 'repartidor');
                })
                ->whereHas('driverStatus', function($q) {
                    $q->where('name', 'disponible');
                })
                ->withCount([
                    'deliveries' => function ($query) use ($activeStatusIds) {
                        $query->whereIn('delivery_status_id', $activeStatusIds);
                    }
                ])
                ->orderBy('deliveries_count', 'asc');

            // Excluir repartidor específico si se proporciona
            if ($excludeDeliveryPersonId) {
                $query->where('id', '!=', $excludeDeliveryPersonId);
            }

            $newDeliveryPerson = $query->first();

            if (!$newDeliveryPerson) {
                Log::warning('⚠️ No hay repartidores disponibles para reasignación', [
                    'order_id' => $order->id
                ]);
                return null;
            }

            $oldDeliveryPersonId = $order->delivery_person_id;

            $order->update([
                'delivery_person_id' => $newDeliveryPerson->id
            ]);

            $order->statusHistory()->create([
                'delivery_status_id' => $order->delivery_status_id,
                'changed_by' => $order->user_id,
                'notes' => "Pedido reasignado a: {$newDeliveryPerson->name}"
            ]);

            Log::info('✅ Pedido reasignado exitosamente', [
                'order_id' => $order->id,
                'old_delivery_person_id' => $oldDeliveryPersonId,
                'new_delivery_person_id' => $newDeliveryPerson->id,
                'new_delivery_person_name' => $newDeliveryPerson->name
            ]);

            // Emitir evento de asignación
            try {
                \App\Events\OrderAssigned::dispatch($order);
            } catch (\Exception $e) {
                Log::error('Error broadcasting OrderAssigned event: ' . $e->getMessage());
            }

            return $newDeliveryPerson;

        } catch (\Exception $e) {
            Log::error('❌ Error al reasignar repartidor', [
                'order_id' => $order->id,
                'error' => $e->getMessage()
            ]);

            return null;
        }
    }

    /**
     * Obtiene estadísticas de carga de trabajo de repartidores
     * 
     * @return \Illuminate\Support\Collection
     */
    public function getDeliveryWorkload()
    {
        $activeStatusIds = DeliveryStatus::whereIn('name', [
            'pendiente',
            'preparando',
            'en_camino'
        ])->pluck('id');

        return User::whereHas('role', function($query) {
                $query->where('name', 'repartidor');
            })
            ->whereHas('driverStatus', function($query) {
                $query->where('name', 'disponible');
            })
            ->withCount([
                'deliveries' => function ($query) use ($activeStatusIds) {
                    $query->whereIn('delivery_status_id', $activeStatusIds);
                }
            ])
            ->orderBy('deliveries_count', 'desc')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'active_orders' => $user->deliveries_count
                ];
            });
    }
}