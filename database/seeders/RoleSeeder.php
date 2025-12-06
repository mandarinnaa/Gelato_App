<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            [
                'name' => 'superadmin',
                'description' => 'Super Administrador con acceso total al sistema',
            ],
            [
                'name' => 'admin',
                'description' => 'Administrador del sistema de pastelería',
            ],
            [
                'name' => 'cliente',
                'description' => 'Cliente de la pastelería',
            ],
            [
                'name' => 'repartidor',
                'description' => 'Repartidor de pedidos',
            ],
        ];

        foreach ($roles as $role) {
            Role::create($role);
        }
    }
}