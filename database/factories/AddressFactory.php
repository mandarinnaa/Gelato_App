<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Address>
 */
class AddressFactory extends Factory
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
            'title' => fake()->randomElement(['Casa', 'Oficina', 'Trabajo', 'Casa de Mamá']),
            'street' => fake()->streetName(),
            'number' => fake()->buildingNumber(),
            'neighborhood' => fake()->randomElement(['Centro', 'Revolución', 'Linda Vista', 'Progreso', 'Reforma']),
            'city' => fake()->city(),
            'state' => fake()->randomElement(['Veracruz', 'CDMX', 'Jalisco', 'Nuevo León', 'Puebla']),
            'postal_code' => fake()->postcode(),
            'reference' => fake()->boolean(60) ? fake()->sentence(8) : null,
        ];
    }
}