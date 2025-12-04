<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Address;
use App\Models\PaymentMethod;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Order>
 */
class OrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'delivery_person_id' => null,
            'address_id' => Address::factory(),
            'payment_method_id' => PaymentMethod::inRandomOrder()->first()?->id ?? PaymentMethod::factory(),
            'status' => fake()->randomElement(['pendiente', 'preparando', 'en_camino', 'entregado', 'cancelado']),
            'total' => fake()->randomFloat(2, 200, 2000),
        ];
    }

    /**
     * Indicate that the order is pending.
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pendiente',
        ]);
    }

    /**
     * Indicate that the order is being prepared.
     */
    public function preparing(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'preparando',
        ]);
    }

    /**
     * Indicate that the order is in delivery.
     */
    public function inDelivery(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'en_camino',
            'delivery_person_id' => User::factory(),
        ]);
    }

    /**
     * Indicate that the order is delivered.
     */
    public function delivered(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'entregado',
            'delivery_person_id' => User::factory(),
        ]);
    }

    /**
     * Indicate that the order is cancelled.
     */
    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'cancelado',
        ]);
    }
}