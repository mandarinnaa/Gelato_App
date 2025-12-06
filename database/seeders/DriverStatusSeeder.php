<?php

namespace Database\Seeders;

use App\Models\DriverStatus;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DriverStatusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $statuses = [
            [
                'name' => 'disponible',
                'description' => 'Repartidor disponible para aceptar entregas',
            ],
            [
                'name' => 'ocupado',
                'description' => 'Repartidor actualmente realizando una entrega',
            ],
            [
                'name' => 'fuera_de_servicio',
                'description' => 'Repartidor no disponible',
            ],
        ];

        foreach ($statuses as $status) {
            DriverStatus::create($status);
        }

        $this->command->info('✅ 3 estados de repartidor creados exitosamente.');
    }
}