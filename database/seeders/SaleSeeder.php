<?php

namespace Database\Seeders;

use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\User;
use App\Models\Product;
use App\Models\Role;
use App\Models\PaymentMethod;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SaleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Obtener usuarios
        $admin = User::where('email', 'admin@pasteleria.com')->first();
        $client = User::where('email', 'cliente@test.com')->first();

        if (!$admin) {
            $this->command->warn('⚠️  No se encontró el admin.');
            return;
        }

        // Obtener métodos de pago
        $paymentMethods = PaymentMethod::all();
        
        if ($paymentMethods->isEmpty()) {
            $this->command->warn('⚠️  No hay métodos de pago disponibles.');
            return;
        }

        // Obtener productos
        $products = Product::available()->limit(3)->get();
        
        if ($products->isEmpty()) {
            $this->command->warn('⚠️  No hay productos disponibles.');
            return;
        }

        // Venta 1: Con cliente registrado
        $sale1 = Sale::create([
            'user_id' => $client?->id,
            'employee_id' => $admin->id,
            'payment_method_id' => $paymentMethods->where('name', 'Efectivo')->first()->id,
            'total' => 0,
        ]);

        foreach ($products->take(2) as $product) {
            $quantity = rand(1, 3);
            SaleItem::create([
                'sale_id' => $sale1->id,
                'product_id' => $product->id,
                'quantity' => $quantity,
                'unit_price' => $product->final_price,
                'subtotal' => $quantity * $product->final_price,
            ]);
        }
        $sale1->updateTotal();

        // Venta 2: Cliente walk-in (sin registro)
        $sale2 = Sale::create([
            'user_id' => null,
            'employee_id' => $admin->id,
            'payment_method_id' => $paymentMethods->where('name', 'Tarjeta de Crédito')->first()->id,
            'total' => 0,
        ]);

        foreach ($products->take(1) as $product) {
            $quantity = rand(2, 4);
            SaleItem::create([
                'sale_id' => $sale2->id,
                'product_id' => $product->id,
                'quantity' => $quantity,
                'unit_price' => $product->final_price,
                'subtotal' => $quantity * $product->final_price,
            ]);
        }
        $sale2->updateTotal();

        // Venta 3: Con cliente registrado, tarjeta de débito
        $sale3 = Sale::create([
            'user_id' => $client?->id,
            'employee_id' => $admin->id,
            'payment_method_id' => $paymentMethods->where('name', 'Tarjeta de Débito')->first()->id,
            'total' => 0,
        ]);

        foreach ($products->take(3) as $product) {
            $quantity = 1;
            SaleItem::create([
                'sale_id' => $sale3->id,
                'product_id' => $product->id,
                'quantity' => $quantity,
                'unit_price' => $product->final_price,
                'subtotal' => $quantity * $product->final_price,
            ]);
        }
        $sale3->updateTotal();

        $this->command->info('✅ 3 ventas de ejemplo creadas exitosamente.');
    }
}