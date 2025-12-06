<?php

namespace Database\Seeders;

use App\Models\DeliveryStatus;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DeliveryStatusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $statuses = [
            [
                'name' => 'pendiente',
                'description' => 'Pedido recibido, esperando confirmación',
            ],
            [
                'name' => 'preparando',
                'description' => 'Pedido en preparación',
            ],
            [
                'name' => 'en_camino',
                'description' => 'Pedido en camino al cliente',
            ],
            [
                'name' => 'entregado',
                'description' => 'Pedido entregado exitosamente',
            ],
            [
                'name' => 'cancelado',
                'description' => 'Pedido cancelado',
            ],
        ];

        foreach ($statuses as $status) {
            DeliveryStatus::create($status);
        }

        $this->command->info('✅ 5 estados de entrega creados exitosamente.');
    }
}