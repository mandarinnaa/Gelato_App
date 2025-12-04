<?php

namespace Database\Seeders;

use App\Models\BasePrice;
use App\Models\Flavor;
use App\Models\Size;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class BasePriceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $flavors = Flavor::all();
        $sizes = Size::all();

        // Precios base por tamaño
        $pricesBySize = [
            'Chico' => 200.00,      // 20cm
            'Mediano' => 400.00,    // 40cm
            'Grande' => 700.00,     // 60cm
        ];

        // Multiplicadores por sabor (algunos sabores son más caros)
        $flavorMultipliers = [
            'Chocolate' => 1.0,
            'Vainilla' => 1.0,
            'Fresa' => 1.1,
            'Red Velvet' => 1.3,
            'Zanahoria' => 1.2,
            'Limón' => 1.1,
        ];

        foreach ($flavors as $flavor) {
            foreach ($sizes as $size) {
                $basePrice = $pricesBySize[$size->name] ?? 200.00;
                $multiplier = $flavorMultipliers[$flavor->name] ?? 1.0;
                $finalPrice = $basePrice * $multiplier;

                BasePrice::create([
                    'flavor_id' => $flavor->id,
                    'size_id' => $size->id,
                    'price' => $finalPrice,
                ]);
            }
        }
    }
}