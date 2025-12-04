<?php

namespace Database\Seeders;

use App\Models\Address;
use App\Models\User;
use App\Models\Role;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AddressSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Obtener rol de cliente
        $clientRole = Role::where('name', 'cliente')->first();

        if (!$clientRole) {
            $this->command->warn('⚠️  El rol "cliente" no existe.');
            return;
        }

        // Buscar o crear un cliente de prueba
        $client = User::where('email', 'cliente@test.com')->first();
        
        if (!$client) {
            $client = User::create([
                'name' => 'Cliente Test',
                'email' => 'cliente@test.com',
                'password' => Hash::make('12345678'),
                'role_id' => $clientRole->id,
                'membership_id' => null,
                'points' => 0,
                'email_verified_at' => now(),
            ]);
            $this->command->info('✅ Cliente de prueba creado: cliente@test.com');
        }

        // Crear direcciones para el cliente
        $addresses = [
            [
                'user_id' => $client->id,
                'title' => 'Casa',
                'street' => 'Calle Principal',
                'number' => '123',
                'neighborhood' => 'Centro',
                'city' => 'Papantla',
                'state' => 'Veracruz',
                'postal_code' => '93400',
                'reference' => 'Casa blanca con portón negro',
            ],
            [
                'user_id' => $client->id,
                'title' => 'Oficina',
                'street' => 'Av. Juárez',
                'number' => '456',
                'neighborhood' => 'Revolución',
                'city' => 'Papantla',
                'state' => 'Veracruz',
                'postal_code' => '93401',
                'reference' => 'Edificio de tres pisos, oficina 205',
            ],
            [
                'user_id' => $client->id,
                'title' => 'Casa de Mamá',
                'street' => 'Boulevard Reforma',
                'number' => '789',
                'neighborhood' => 'Linda Vista',
                'city' => 'Papantla',
                'state' => 'Veracruz',
                'postal_code' => '93402',
                'reference' => null,
            ],
        ];

        foreach ($addresses as $address) {
            Address::create($address);
        }

        $this->command->info('✅ 3 direcciones de ejemplo creadas exitosamente.');
    }
}