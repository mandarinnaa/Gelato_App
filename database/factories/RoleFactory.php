<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Role>
 */
class RoleFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->randomElement(['superadmin', 'admin', 'cliente', 'repartidor']),
            'description' => fake()->sentence(),
        ];
    }

    /**
     * Indicate that the role is superadmin.
     */
    public function superadmin(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'superadmin',
            'description' => 'Super Administrador con acceso total',
        ]);
    }

    /**
     * Indicate that the role is admin.
     */
    public function admin(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'admin',
            'description' => 'Administrador del sistema',
        ]);
    }

    /**
     * Indicate that the role is client.
     */
    public function cliente(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'cliente',
            'description' => 'Cliente de la pastelería',
        ]);
    }

    /**
     * Indicate that the role is delivery.
     */
    public function repartidor(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'repartidor',
            'description' => 'Repartidor de pedidos',
        ]);
    }
}