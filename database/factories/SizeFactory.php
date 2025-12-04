<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Size>
 */
class SizeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->randomElement(['Chico', 'Mediano', 'Grande']),
            'diameter_cm' => fake()->randomElement([20, 40, 60]),
            'servings' => fake()->numberBetween(6, 30),
            'is_default' => false,
            'available' => true,
        ];
    }

    /**
     * Indicate that the size is default.
     */
    public function default(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_default' => true,
        ]);
    }

    /**
     * Indicate that the size is small.
     */
    public function small(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Chico',
            'diameter_cm' => 20,
            'servings' => 8,
            'is_default' => true,
        ]);
    }

    /**
     * Indicate that the size is medium.
     */
    public function medium(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Mediano',
            'diameter_cm' => 40,
            'servings' => 15,
        ]);
    }

    /**
     * Indicate that the size is large.
     */
    public function large(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Grande',
            'diameter_cm' => 60,
            'servings' => 30,
        ]);
    }
}