<?php

namespace Database\Seeders;

use App\Models\Filling;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class FillingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $fillings = [
            [
                'name' => 'Crema Pastelera',
                'description' => 'Crema pastelera clásica hecha en casa',
                'extra_price' => 30.00,
                'available' => true,
            ],
            [
                'name' => 'Nutella',
                'description' => 'Deliciosa crema de avellana con cacao',
                'extra_price' => 50.00,
                'available' => true,
            ],
            [
                'name' => 'Cajeta',
                'description' => 'Cajeta de leche de cabra artesanal',
                'extra_price' => 40.00,
                'available' => true,
            ],
            [
                'name' => 'Mermelada de Fresa',
                'description' => 'Mermelada de fresa natural',
                'extra_price' => 25.00,
                'available' => true,
            ],
            [
                'name' => 'Crema de Chocolate',
                'description' => 'Crema suave de chocolate belga',
                'extra_price' => 45.00,
                'available' => true,
            ],
        ];

        foreach ($fillings as $filling) {
            Filling::create($filling);
        }
    }
}