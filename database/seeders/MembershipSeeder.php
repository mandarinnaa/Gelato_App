<?php

namespace Database\Seeders;

use App\Models\Membership;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class MembershipSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $memberships = [
            [
                'name' => 'Básica',
                'price' => 0.00,
                'discount_percent' => 0.00,
                'points_multiplier' => 1.00,
                'min_spent' => 0.00,
            ],
            [
                'name' => 'Premium',
                'price' => 199.00,
                'discount_percent' => 10.00,
                'points_multiplier' => 1.50,
                'min_spent' => 1000.00,
            ],
            [
                'name' => 'VIP',
                'price' => 499.00,
                'discount_percent' => 20.00,
                'points_multiplier' => 2.00,
                'min_spent' => 3000.00,
            ],
        ];

        foreach ($memberships as $membership) {
            Membership::create($membership);
        }
    }
}