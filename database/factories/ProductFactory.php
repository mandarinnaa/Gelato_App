<?php

namespace Database\Factories;

use App\Models\Flavor;
use App\Models\Size;
use App\Models\Filling;
use App\Models\BasePrice;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $flavor = Flavor::inRandomOrder()->first();
        $size = Size::inRandomOrder()->first();
        $filling = fake()->boolean(70) ? Filling::inRandomOrder()->first() : null;
        $category = \App\Models\ProductCategory::inRandomOrder()->first();
        
        // Obtener el precio base de la combinación flavor-size
        $basePrice = BasePrice::where('flavor_id', $flavor->id)
            ->where('size_id', $size->id)
            ->first();

        // Calcular precio final
        $finalPrice = $basePrice->price;
        if ($filling) {
            $finalPrice += $filling->extra_price;
        }

        return [
            'category_id' => $category?->id ?? \App\Models\ProductCategory::factory(),
            'name' => $flavor->name . ' ' . $size->name,
            'description' => fake()->sentence(15),
            'image' => null,
            'flavor_id' => $flavor->id,
            'size_id' => $size->id,
            'filling_id' => $filling?->id,
            'base_price_id' => $basePrice->id,
            'final_price' => $finalPrice,
            'available' => fake()->boolean(90),
            'featured' => fake()->boolean(30),
            'stock' => fake()->numberBetween(0, 20),
        ];
    }

    /**
     * Indicate that the product is featured.
     */
    public function featured(): static
    {
        return $this->state(fn (array $attributes) => [
            'featured' => true,
        ]);
    }

    /**
     * Indicate that the product is unavailable.
     */
    public function unavailable(): static
    {
        return $this->state(fn (array $attributes) => [
            'available' => false,
        ]);
    }

    /**
     * Indicate that the product is out of stock.
     */
    public function outOfStock(): static
    {
        return $this->state(fn (array $attributes) => [
            'stock' => 0,
        ]);
    }
}