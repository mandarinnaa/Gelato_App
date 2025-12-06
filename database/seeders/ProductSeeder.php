<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Flavor;
use App\Models\Size;
use App\Models\Filling;
use App\Models\Topping;
use App\Models\BasePrice;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Obtener datos necesarios
        $chocolateFlavor = Flavor::where('name', 'Chocolate')->first();
        $vanillaFlavor = Flavor::where('name', 'Vainilla')->first();
        $strawberryFlavor = Flavor::where('name', 'Fresa')->first();

        $smallSize = Size::where('name', 'Chico')->first();
        $mediumSize = Size::where('name', 'Mediano')->first();

        $nutellaFilling = Filling::where('name', 'Nutella')->first();
        $creamFilling = Filling::where('name', 'Crema Pastelera')->first();

        // Obtener categoría de Pasteles
        $pastelesCategory = \App\Models\ProductCategory::where('name', 'Pasteles')->first();
        
        if (!$pastelesCategory) {
            $this->command->warn('⚠️  No existe la categoría Pasteles. Ejecuta ProductCategorySeeder primero.');
            return;
        }

        // Toppings
        $strawberriesTop = Topping::where('name', 'Fresas')->first();
        $chipsTop = Topping::where('name', 'Chispas de Chocolate')->first();
        $oreoTop = Topping::where('name', 'Oreo')->first();
        $nutsTop = Topping::where('name', 'Nueces')->first();

        // Producto 1: Chocolate Chico con Nutella y Fresas
        $basePrice1 = BasePrice::where('flavor_id', $chocolateFlavor->id)
            ->where('size_id', $smallSize->id)
            ->first();

        $product1 = Product::create([
            'category_id' => $pastelesCategory->id,
            'name' => 'Pastel de Chocolate Chico Especial',
            'description' => 'Delicioso pastel de chocolate chico con relleno de Nutella y decorado con fresas frescas.',
            'image' => null,
            'flavor_id' => $chocolateFlavor->id,
            'size_id' => $smallSize->id,
            'filling_id' => $nutellaFilling->id,
            'base_price_id' => $basePrice1->id,
            'final_price' => $basePrice1->price + $nutellaFilling->extra_price + $strawberriesTop->extra_price,
            'available' => true,
            'featured' => true,
            'stock' => 10,
        ]);

        $product1->toppings()->attach([$strawberriesTop->id]);

        // Producto 2: Vainilla Mediano con Crema y Oreo
        $basePrice2 = BasePrice::where('flavor_id', $vanillaFlavor->id)
            ->where('size_id', $mediumSize->id)
            ->first();

        $product2 = Product::create([
            'category_id' => $pastelesCategory->id,
            'name' => 'Pastel de Vainilla Mediano con Oreo',
            'description' => 'Esponjoso pastel de vainilla mediano con crema pastelera y galletas Oreo trituradas.',
            'image' => null,
            'flavor_id' => $vanillaFlavor->id,
            'size_id' => $mediumSize->id,
            'filling_id' => $creamFilling->id,
            'base_price_id' => $basePrice2->id,
            'final_price' => $basePrice2->price + $creamFilling->extra_price + $oreoTop->extra_price,
            'available' => true,
            'featured' => true,
            'stock' => 8,
        ]);

        $product2->toppings()->attach([$oreoTop->id]);

        // Producto 3: Fresa Chico con Chispas y Nueces
        $basePrice3 = BasePrice::where('flavor_id', $strawberryFlavor->id)
            ->where('size_id', $smallSize->id)
            ->first();

        $product3 = Product::create([
            'category_id' => $pastelesCategory->id,
            'name' => 'Pastel de Fresa Chico Gourmet',
            'description' => 'Pastel de fresa natural chico con chispas de chocolate y nueces caramelizadas.',
            'image' => null,
            'flavor_id' => $strawberryFlavor->id,
            'size_id' => $smallSize->id,
            'filling_id' => null,
            'base_price_id' => $basePrice3->id,
            'final_price' => $basePrice3->price + $chipsTop->extra_price + $nutsTop->extra_price,
            'available' => true,
            'featured' => false,
            'stock' => 5,
        ]);

        $product3->toppings()->attach([$chipsTop->id, $nutsTop->id]);

        $this->command->info('✅ 3 productos de ejemplo creados exitosamente.');
    }
}