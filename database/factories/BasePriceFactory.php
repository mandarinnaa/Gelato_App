<?php

namespace Database\Factories;

use App\Models\Flavor;
use App\Models\Size;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\BasePrice>
 */
class BasePriceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'flavor_id' => Flavor::factory(),
            'size_id' => Size::factory(),
            'price' => fake()->randomFloat(2, 150, 800),
        ];
    }
}