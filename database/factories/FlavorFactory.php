<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Flavor>
 */
class FlavorFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->randomElement(['Chocolate', 'Vainilla', 'Fresa', 'Red Velvet', 'Zanahoria', 'Limón']),
            'description' => fake()->sentence(10),
            'available' => fake()->boolean(90),
        ];
    }

    /**
     * Indicate that the flavor is unavailable.
     */
    public function unavailable(): static
    {
        return $this->state(fn (array $attributes) => [
            'available' => false,
        ]);
    }
}