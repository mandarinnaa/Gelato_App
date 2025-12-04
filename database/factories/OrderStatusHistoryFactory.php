<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\DeliveryStatus;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderStatusHistoryFactory extends Factory
{
    public function definition(): array
    {
        return [
            'order_id' => Order::factory(),
            'delivery_status_id' => DeliveryStatus::inRandomOrder()->first()?->id ?? DeliveryStatus::factory(),
            'changed_by' => fake()->boolean(60) ? User::factory() : null,
            'notes' => fake()->boolean(40) ? fake()->sentence(12) : null,
        ];
    }
}