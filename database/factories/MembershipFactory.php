<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Membership>
 */
class MembershipFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->randomElement(['Básica', 'Premium', 'VIP']),
            'price' => fake()->randomFloat(2, 0, 500),
            'discount_percent' => fake()->randomFloat(2, 0, 30),
            'points_multiplier' => fake()->randomFloat(2, 1, 3),
            'min_spent' => fake()->randomFloat(2, 0, 5000),
        ];
    }

    /**
     * Indicate that the membership is basic.
     */
    public function basic(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Básica',
            'price' => 0.00,
            'discount_percent' => 0.00,
            'points_multiplier' => 1.00,
            'min_spent' => 0.00,
        ]);
    }

    /**
     * Indicate that the membership is premium.
     */
    public function premium(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Premium',
            'price' => 199.00,
            'discount_percent' => 10.00,
            'points_multiplier' => 1.50,
            'min_spent' => 1000.00,
        ]);
    }

    /**
     * Indicate that the membership is VIP.
     */
    public function vip(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'VIP',
            'price' => 499.00,
            'discount_percent' => 20.00,
            'points_multiplier' => 2.00,
            'min_spent' => 3000.00,
        ]);
    }
}