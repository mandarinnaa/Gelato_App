<?php

namespace Database\Seeders;

use App\Models\Topping;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ToppingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $toppings = [
            [
                'name' => 'Fresas',
                'description' => 'Fresas frescas en rebanadas',
                'extra_price' => 35.00,
                'available' => true,
            ],
            [
                'name' => 'Chispas de Chocolate',
                'description' => 'Chispas de chocolate semi-amargo',
                'extra_price' => 20.00,
                'available' => true,
            ],
            [
                'name' => 'Nueces',
                'description' => 'Nueces caramelizadas picadas',
                'extra_price' => 40.00,
                'available' => true,
            ],
            [
                'name' => 'M&Ms',
                'description' => 'Chocolates M&Ms de colores',
                'extra_price' => 30.00,
                'available' => true,
            ],
            [
                'name' => 'Oreo',
                'description' => 'Galletas Oreo trituradas',
                'extra_price' => 35.00,
                'available' => true,
            ],
            [
                'name' => 'Cerezas',
                'description' => 'Cerezas al marrasquino',
                'extra_price' => 45.00,
                'available' => true,
            ],
        ];

        foreach ($toppings as $topping) {
            Topping::create($topping);
        }
    }
}