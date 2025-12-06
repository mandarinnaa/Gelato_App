<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Filling>
 */
class FillingFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->randomElement(['Crema Pastelera', 'Nutella', 'Cajeta', 'Mermelada de Fresa', 'Crema de Chocolate']),
            'description' => fake()->sentence(8),
            'extra_price' => fake()->randomFloat(2, 20, 80),
            'available' => fake()->boolean(90),
        ];
    }

    /**
     * Indicate that the filling is unavailable.
     */
    public function unavailable(): static
    {
        return $this->state(fn (array $attributes) => [
            'available' => false,
        ]);
    }
}