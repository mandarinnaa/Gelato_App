<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Topping>
 */
class ToppingFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->randomElement(['Fresas', 'Chispas de Chocolate', 'Nueces', 'M&Ms', 'Oreo', 'Cerezas']),
            'description' => fake()->sentence(8),
            'extra_price' => fake()->randomFloat(2, 15, 60),
            'available' => fake()->boolean(90),
        ];
    }

    /**
     * Indicate that the topping is unavailable.
     */
    public function unavailable(): static
    {
        return $this->state(fn (array $attributes) => [
            'available' => false,
        ]);
    }
}