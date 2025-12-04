<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use App\Models\Product;
use App\Models\Role;
use App\Models\Address;
use App\Models\PaymentMethod;
use App\Models\DeliveryStatus;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class OrderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Obtener usuarios
        $clientRole = Role::where('name', 'cliente')->first();
        $deliveryRole = Role::where('name', 'repartidor')->first();

        // Buscar o crear cliente
        $client = User::where('email', 'cliente@test.com')->first();
        if (!$client) {
            $this->command->warn('⚠️  El cliente no existe. Asegúrate de ejecutar AddressSeeder primero.');
            return;
        }

        // Buscar o crear repartidor
        $delivery = User::where('email', 'repartidor@test.com')->first();
        if (!$delivery) {
            $delivery = User::create([
                'name' => 'Repartidor Test',
                'email' => 'repartidor@test.com',
                'password' => Hash::make('12345678'),
                'role_id' => $deliveryRole->id,
                'membership_id' => null,
                'points' => 0,
                'email_verified_at' => now(),
            ]);
            $this->command->info('✅ Repartidor de prueba creado: repartidor@test.com');
        }

        // Obtener direcciones del cliente
        $addresses = Address::where('user_id', $client->id)->get();
        
        if ($addresses->isEmpty()) {
            $this->command->warn('⚠️  No hay direcciones disponibles. Ejecuta AddressSeeder primero.');
            return;
        }

        // Obtener métodos de pago
        $paymentMethods = PaymentMethod::all();
        
        if ($paymentMethods->isEmpty()) {
            $this->command->warn('⚠️  No hay métodos de pago disponibles. Ejecuta PaymentMethodSeeder primero.');
            return;
        }

        // Obtener estados de entrega
        $deliveryStatuses = DeliveryStatus::all();
        $pendienteStatus = $deliveryStatuses->where('name', 'pendiente')->first();
        $preparandoStatus = $deliveryStatuses->where('name', 'preparando')->first();
        $enCaminoStatus = $deliveryStatuses->where('name', 'en_camino')->first();
        $entregadoStatus = $deliveryStatuses->where('name', 'entregado')->first();

        // Obtener productos
        $products = Product::available()->limit(3)->get();
        
        if ($products->isEmpty()) {
            $this->command->warn('⚠️  No hay productos disponibles. Ejecuta ProductSeeder primero.');
            return;
        }

        // Pedido 1: Pendiente
        $order1 = Order::create([
            'user_id' => $client->id,
            'delivery_person_id' => null,
            'address_id' => $addresses->first()->id,
            'payment_method_id' => $paymentMethods->where('name', 'Efectivo')->first()->id,
            'delivery_status_id' => $pendienteStatus->id,
            'total' => 0,
        ]);

        // Registrar historial de estado
        $order1->statusHistory()->create([
            'delivery_status_id' => $pendienteStatus->id,
            'changed_by' => null,
            'notes' => 'Pedido creado',
        ]);

        foreach ($products->take(2) as $product) {
            $quantity = rand(1, 3);
            OrderItem::create([
                'order_id' => $order1->id,
                'product_id' => $product->id,
                'quantity' => $quantity,
                'unit_price' => $product->final_price,
                'subtotal' => $quantity * $product->final_price,
            ]);
        }
        $order1->updateTotal();

        // Pedido 2: En camino (con repartidor asignado)
        $order2 = Order::create([
            'user_id' => $client->id,
            'delivery_person_id' => $delivery->id,
            'address_id' => $addresses->skip(1)->first()->id ?? $addresses->first()->id,
            'payment_method_id' => $paymentMethods->where('name', 'Tarjeta de Crédito')->first()->id,
            'delivery_status_id' => $enCaminoStatus->id,
            'total' => 0,
        ]);

        // Registrar historial de cambios de estado
        $order2->statusHistory()->create([
            'delivery_status_id' => $pendienteStatus->id,
            'changed_by' => null,
            'notes' => 'Pedido creado',
            'created_at' => now()->subHours(2),
        ]);
        
        $order2->statusHistory()->create([
            'delivery_status_id' => $preparandoStatus->id,
            'changed_by' => null,
            'notes' => 'Pedido en preparación',
            'created_at' => now()->subHour(),
        ]);
        
        $order2->statusHistory()->create([
            'delivery_status_id' => $enCaminoStatus->id,
            'changed_by' => $delivery->id,
            'notes' => 'Pedido asignado a repartidor y en camino',
            'created_at' => now()->subMinutes(30),
        ]);

        foreach ($products->take(3) as $product) {
            $quantity = rand(1, 2);
            OrderItem::create([
                'order_id' => $order2->id,
                'product_id' => $product->id,
                'quantity' => $quantity,
                'unit_price' => $product->final_price,
                'subtotal' => $quantity * $product->final_price,
            ]);
        }
        $order2->updateTotal();

        // Pedido 3: Entregado
        $order3 = Order::create([
            'user_id' => $client->id,
            'delivery_person_id' => $delivery->id,
            'address_id' => $addresses->last()->id,
            'payment_method_id' => $paymentMethods->where('name', 'Transferencia Bancaria')->first()->id,
            'delivery_status_id' => $entregadoStatus->id,
            'total' => 0,
        ]);

        // Registrar historial completo
        $order3->statusHistory()->create([
            'delivery_status_id' => $pendienteStatus->id,
            'changed_by' => null,
            'notes' => 'Pedido creado',
            'created_at' => now()->subDays(1),
        ]);
        
        $order3->statusHistory()->create([
            'delivery_status_id' => $preparandoStatus->id,
            'changed_by' => null,
            'notes' => 'Iniciando preparación',
            'created_at' => now()->subDays(1)->addHours(1),
        ]);
        
        $order3->statusHistory()->create([
            'delivery_status_id' => $enCaminoStatus->id,
            'changed_by' => $delivery->id,
            'notes' => 'Salió para entrega',
            'created_at' => now()->subDays(1)->addHours(2),
        ]);
        
        $order3->statusHistory()->create([
            'delivery_status_id' => $entregadoStatus->id,
            'changed_by' => $delivery->id,
            'notes' => 'Entregado exitosamente al cliente',
            'created_at' => now()->subDays(1)->addHours(3),
        ]);

        foreach ($products->take(1) as $product) {
            $quantity = rand(2, 4);
            OrderItem::create([
                'order_id' => $order3->id,
                'product_id' => $product->id,
                'quantity' => $quantity,
                'unit_price' => $product->final_price,
                'subtotal' => $quantity * $product->final_price,
            ]);
        }
        $order3->updateTotal();

        $this->command->info('✅ 3 pedidos de ejemplo creados exitosamente.');
    }
}