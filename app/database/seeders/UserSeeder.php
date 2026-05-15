<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $roles = Role::query()->whereIn('name', [
            'Admin',
            'Manager',
            'Supervisor',
            'Cashier Basic',
            'Cashier Full',
            'Viewer',
        ])->get()->keyBy('name');

        $users = [
            ['name' => 'Admin User', 'email' => 'admin@meron.test', 'role' => 'Admin'],
            ['name' => 'Manager User', 'email' => 'manager@meron.test', 'role' => 'Manager'],
            ['name' => 'Supervisor User', 'email' => 'supervisor@meron.test', 'role' => 'Supervisor'],
            ['name' => 'Cashier Basic User', 'email' => 'cashier.basic@meron.test', 'role' => 'Cashier Basic'],
            ['name' => 'Cashier Full User', 'email' => 'cashier.full@meron.test', 'role' => 'Cashier Full'],
            ['name' => 'Viewer User', 'email' => 'viewer@meron.test', 'role' => 'Viewer'],
        ];

        foreach ($users as $user) {
            $role = $roles->get($user['role']);

            User::query()->updateOrCreate(
                ['email' => $user['email']],
                [
                    'name' => $user['name'],
                    'password' => 'password',
                    'role_id' => $role?->id,
                ]
            );
        }
    }
}
