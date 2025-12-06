<?php

namespace Database\Seeders;

use App\Models\Size;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SizeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $sizes = [
            [
                'name' => 'Chico',
                'diameter_cm' => 20,
                'servings' => 8,
                'is_default' => true,
                'available' => true,
            ],
            [
                'name' => 'Mediano',
                'diameter_cm' => 40,
                'servings' => 15,
                'is_default' => false,
                'available' => true,
            ],
            [
                'name' => 'Grande',
                'diameter_cm' => 60,
                'servings' => 30,
                'is_default' => false,
                'available' => true,
            ],
        ];

        foreach ($sizes as $size) {
            Size::create($size);
        }
    }
}