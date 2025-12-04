<?php

namespace Database\Factories;

use App\Models\Role;
use App\Models\Membership;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
            'role_id' => Role::where('name', 'cliente')->first()?->id ?? Role::factory()->cliente(),
            'membership_id' => fake()->boolean(70) ? Membership::inRandomOrder()->first()?->id : null,
            'points' => fake()->numberBetween(0, 1000),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    /**
     * Indicate that the user is a superadmin.
     */
    public function superadmin(): static
    {
        return $this->state(fn (array $attributes) => [
            'role_id' => Role::where('name', 'superadmin')->first()?->id ?? Role::factory()->superadmin(),
            'membership_id' => null,
            'points' => 0,
        ]);
    }

    /**
     * Indicate that the user is an admin.
     */
    public function admin(): static
    {
        return $this->state(fn (array $attributes) => [
            'role_id' => Role::where('name', 'admin')->first()?->id ?? Role::factory()->admin(),
            'membership_id' => null,
            'points' => 0,
        ]);
    }

    /**
     * Indicate that the user is a client.
     */
    public function client(): static
    {
        return $this->state(fn (array $attributes) => [
            'role_id' => Role::where('name', 'cliente')->first()?->id ?? Role::factory()->cliente(),
        ]);
    }

    /**
     * Indicate that the user is a delivery person.
     */
    public function delivery(): static
    {
        return $this->state(fn (array $attributes) => [
            'role_id' => Role::where('name', 'repartidor')->first()?->id ?? Role::factory()->repartidor(),
            'membership_id' => null,
            'points' => 0,
        ]);
    }
}