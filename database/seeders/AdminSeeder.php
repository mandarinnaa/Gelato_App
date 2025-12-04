<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $superadminRole = Role::where('name', 'superadmin')->first();

        User::create([
            'name' => 'Super Admin',
            'email' => 'admin@pasteleria.com',
            'password' => Hash::make('12345678'),
            'role_id' => $superadminRole->id,
            'membership_id' => null,
            'points' => 0,
            'email_verified_at' => now(),
        ]);
    }
}