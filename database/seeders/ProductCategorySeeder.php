<?php

namespace Database\Seeders;

use App\Models\ProductCategory;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProductCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Pasteles',
                'description' => 'Pasteles de diferentes tamaños y sabores',
            ],
            [
                'name' => 'Cupcakes',
                'description' => 'Cupcakes individuales decorados',
            ],
            [
                'name' => 'Galletas',
                'description' => 'Galletas artesanales y decoradas',
            ],
            [
                'name' => 'Postres',
                'description' => 'Postres variados y especiales',
            ],
            [
                'name' => 'Especiales',
                'description' => 'Productos para ocasiones especiales',
            ],
        ];

        foreach ($categories as $category) {
            ProductCategory::create($category);
        }

        $this->command->info('✅ 5 categorías de productos creadas exitosamente.');
    }
}