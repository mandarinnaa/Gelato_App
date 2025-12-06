<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PaymentMethodSeeder extends Seeder
{
    public function run(): void
    {
        $paymentMethods = [
            [
                'name' => 'Tarjeta de Débito',
                'description' => 'Pago con tarjeta de débito',
            ],
            [
                'name' => 'Tarjeta de Crédito',
                'description' => 'Pago con tarjeta de crédito',
            ],
            [
                'name' => 'PayPal',
                'description' => 'Pago con cuenta de PayPal',
            ],
        ];

        foreach ($paymentMethods as $method) {
            DB::table('payment_methods')->updateOrInsert(
                ['name' => $method['name']], // Buscar por nombre
                [
                    'description' => $method['description'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }

        $this->command->info('✅ Métodos de pago creados/actualizados correctamente');
    }
}