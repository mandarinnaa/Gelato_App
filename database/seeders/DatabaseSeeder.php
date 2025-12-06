<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Crear roles y membresías primero
        $this->call([
            RoleSeeder::class,
            MembershipSeeder::class,
            AdminSeeder::class,
        ]);

        // Crear catálogo de productos
        $this->call([
            FlavorSeeder::class,
            SizeSeeder::class,
            FillingSeeder::class,
            ToppingSeeder::class,
            BasePriceSeeder::class,
            ProductCategorySeeder::class,
        ]);

        // Crear productos de ejemplo
        $this->call([
            ProductSeeder::class,
        ]);

        // Crear direcciones y métodos de pago
        $this->call([
            AddressSeeder::class,
            PaymentMethodSeeder::class,
            DeliveryStatusSeeder::class,
            DriverStatusSeeder::class,
        ]);

        // Crear pedidos de ejemplo (opcional)
        $this->call([
            OrderSeeder::class,
        ]);

        // Crear ventas en tienda física (opcional)
        $this->call([
            SaleSeeder::class,
        ]);

        // Crear usuarios de prueba (opcional)
        // User::factory(10)->client()->create();
        // User::factory(3)->admin()->create();
        // User::factory(5)->delivery()->create();
    }
}