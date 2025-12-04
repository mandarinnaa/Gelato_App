<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PaymentMethod>
 */
class PaymentMethodFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->randomElement(['Efectivo', 'Tarjeta de Crédito', 'Tarjeta de Débito', 'PayPal', 'Transferencia Bancaria']),
            'description' => fake()->sentence(10),
        ];
    }
}