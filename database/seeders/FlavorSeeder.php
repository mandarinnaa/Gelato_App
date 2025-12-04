<?php

namespace Database\Seeders;

use App\Models\Flavor;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class FlavorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $flavors = [
            [
                'name' => 'Chocolate',
                'description' => 'Delicioso pastel de chocolate con cacao premium',
                'available' => true,
            ],
            [
                'name' => 'Vainilla',
                'description' => 'Clásico pastel de vainilla suave y esponjoso',
                'available' => true,
            ],
            [
                'name' => 'Fresa',
                'description' => 'Pastel de fresa con fresas naturales',
                'available' => true,
            ],
            [
                'name' => 'Red Velvet',
                'description' => 'Pastel red velvet con queso crema',
                'available' => true,
            ],
            [
                'name' => 'Zanahoria',
                'description' => 'Pastel de zanahoria con nueces y especias',
                'available' => true,
            ],
            [
                'name' => 'Limón',
                'description' => 'Pastel de limón fresco y cítrico',
                'available' => true,
            ],
        ];

        foreach ($flavors as $flavor) {
            Flavor::create($flavor);
        }
    }
}