<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RbacSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            ['name' => 'Admin', 'label' => 'Admin'],
            ['name' => 'Manager', 'label' => 'Manager'],
            ['name' => 'Supervisor', 'label' => 'Supervisor'],
            ['name' => 'Cashier Basic', 'label' => 'Cashier Basic'],
            ['name' => 'Cashier Full', 'label' => 'Cashier Full'],
            ['name' => 'Viewer', 'label' => 'Viewer'],
        ];

        foreach ($roles as $role) {
            Role::query()->updateOrCreate(
                ['name' => $role['name']],
                ['label' => $role['label']]
            );
        }

        $permissions = [
            ['name' => 'create_event', 'label' => 'Create Event', 'category' => 'admin', 'sort_order' => 10],
            ['name' => 'view_reports', 'label' => 'View Reports', 'category' => 'reports', 'sort_order' => 20],
            ['name' => 'export_reports', 'label' => 'Export Reports', 'category' => 'reports', 'sort_order' => 30],
            ['name' => 'manage_users', 'label' => 'Manage Users', 'category' => 'admin', 'sort_order' => 40],

            ['name' => 'users.view', 'label' => 'View Users', 'category' => 'users', 'sort_order' => 10],
            ['name' => 'users.create', 'label' => 'Create Users', 'category' => 'users', 'sort_order' => 20],
            ['name' => 'users.update', 'label' => 'Update Users', 'category' => 'users', 'sort_order' => 30],
            ['name' => 'users.delete', 'label' => 'Delete Users', 'category' => 'users', 'sort_order' => 40],

            ['name' => 'players.view', 'label' => 'View Players', 'category' => 'players', 'sort_order' => 10],
            ['name' => 'players.create', 'label' => 'Create Players', 'category' => 'players', 'sort_order' => 20],
            ['name' => 'players.update', 'label' => 'Update Players', 'category' => 'players', 'sort_order' => 30],
            ['name' => 'players.delete', 'label' => 'Delete Players', 'category' => 'players', 'sort_order' => 40],

            ['name' => 'cocks.view', 'label' => 'View Cocks', 'category' => 'cocks', 'sort_order' => 10],
            ['name' => 'cocks.create', 'label' => 'Create Cocks', 'category' => 'cocks', 'sort_order' => 20],
            ['name' => 'cocks.update', 'label' => 'Update Cocks', 'category' => 'cocks', 'sort_order' => 30],
            ['name' => 'cocks.delete', 'label' => 'Delete Cocks', 'category' => 'cocks', 'sort_order' => 40],

            ['name' => 'games.view', 'label' => 'View Games', 'category' => 'games', 'sort_order' => 10],
            ['name' => 'games.create', 'label' => 'Create Games', 'category' => 'games', 'sort_order' => 20],
            ['name' => 'games.update', 'label' => 'Update Games', 'category' => 'games', 'sort_order' => 30],
            ['name' => 'games.delete', 'label' => 'Delete Games', 'category' => 'games', 'sort_order' => 40],

            ['name' => 'matches.view', 'label' => 'View Matches', 'category' => 'matches', 'sort_order' => 10],
            ['name' => 'matches.create', 'label' => 'Create Matches', 'category' => 'matches', 'sort_order' => 20],
            ['name' => 'matches.update', 'label' => 'Update Matches', 'category' => 'matches', 'sort_order' => 30],
            ['name' => 'matches.delete', 'label' => 'Delete Matches', 'category' => 'matches', 'sort_order' => 40],

            ['name' => 'bets.view', 'label' => 'View Bets', 'category' => 'bets', 'sort_order' => 10],
            ['name' => 'bets.create', 'label' => 'Create Bets', 'category' => 'bets', 'sort_order' => 20],
            ['name' => 'bets.update', 'label' => 'Update Bets', 'category' => 'bets', 'sort_order' => 30],
            ['name' => 'bets.delete', 'label' => 'Delete Bets', 'category' => 'bets', 'sort_order' => 40],

            ['name' => 'reports.view', 'label' => 'View Reports (Menu)', 'category' => 'reports', 'sort_order' => 10],
            ['name' => 'reports.export', 'label' => 'Export Reports', 'category' => 'reports', 'sort_order' => 20],

            ['name' => 'settings.roles.view', 'label' => 'View Roles', 'category' => 'settings', 'sort_order' => 10],
            ['name' => 'settings.roles.create', 'label' => 'Create Roles', 'category' => 'settings', 'sort_order' => 20],
            ['name' => 'settings.roles.update', 'label' => 'Update Roles', 'category' => 'settings', 'sort_order' => 30],
            ['name' => 'settings.roles.delete', 'label' => 'Delete Roles', 'category' => 'settings', 'sort_order' => 40],
            ['name' => 'settings.permissions.view', 'label' => 'View Permissions', 'category' => 'settings', 'sort_order' => 50],
            ['name' => 'settings.rbac_matrix.view', 'label' => 'View RBAC Matrix', 'category' => 'settings', 'sort_order' => 60],

            ['name' => 'process_bet', 'label' => 'Process Bet', 'category' => 'betting', 'sort_order' => 50],
            ['name' => 'process_payout', 'label' => 'Process Payout', 'category' => 'cashier', 'sort_order' => 60],
            ['name' => 'void_bet', 'label' => 'Void Bet', 'category' => 'cashier', 'sort_order' => 70],
            ['name' => 'cash_in', 'label' => 'Cash In', 'category' => 'cashier', 'sort_order' => 80],
            ['name' => 'cash_out', 'label' => 'Cash Out', 'category' => 'cashier', 'sort_order' => 90],
        ];

        foreach ($permissions as $permission) {
            Permission::query()->updateOrCreate(
                ['name' => $permission['name']],
                [
                    'label' => $permission['label'],
                    'category' => $permission['category'],
                    'sort_order' => $permission['sort_order'],
                ]
            );
        }

        $matrix = [
            'create_event' => ['Admin', 'Manager'],
            'view_reports' => ['Admin', 'Manager', 'Supervisor', 'Cashier Basic', 'Cashier Full', 'Viewer'],
            'export_reports' => ['Admin', 'Manager', 'Viewer'],
            'manage_users' => ['Admin', 'Manager'],

            'users.view' => ['Admin', 'Manager', 'Supervisor', 'Viewer'],
            'users.create' => ['Admin', 'Manager'],
            'users.update' => ['Admin', 'Manager'],
            'users.delete' => ['Admin'],

            'players.view' => ['Admin', 'Manager', 'Supervisor', 'Viewer'],
            'players.create' => ['Admin', 'Manager', 'Supervisor'],
            'players.update' => ['Admin', 'Manager', 'Supervisor'],
            'players.delete' => ['Admin', 'Manager'],

            'cocks.view' => ['Admin', 'Manager', 'Supervisor', 'Viewer'],
            'cocks.create' => ['Admin', 'Manager', 'Supervisor'],
            'cocks.update' => ['Admin', 'Manager', 'Supervisor'],
            'cocks.delete' => ['Admin', 'Manager'],

            'games.view' => ['Admin', 'Manager', 'Supervisor', 'Viewer'],
            'games.create' => ['Admin', 'Manager', 'Supervisor'],
            'games.update' => ['Admin', 'Manager', 'Supervisor'],
            'games.delete' => ['Admin', 'Manager'],

            'matches.view' => ['Admin', 'Manager', 'Supervisor', 'Viewer'],
            'matches.create' => ['Admin', 'Manager', 'Supervisor'],
            'matches.update' => ['Admin', 'Manager', 'Supervisor'],
            'matches.delete' => ['Admin', 'Manager'],

            'bets.view' => ['Admin', 'Manager', 'Supervisor', 'Viewer'],
            'bets.create' => ['Admin', 'Manager', 'Supervisor'],
            'bets.update' => ['Admin', 'Manager', 'Supervisor'],
            'bets.delete' => ['Admin', 'Manager'],

            'reports.view' => ['Admin', 'Manager', 'Supervisor', 'Cashier Basic', 'Cashier Full', 'Viewer'],
            'reports.export' => ['Admin', 'Manager', 'Viewer'],

            'settings.roles.view' => ['Admin'],
            'settings.roles.create' => ['Admin'],
            'settings.roles.update' => ['Admin'],
            'settings.roles.delete' => ['Admin'],
            'settings.permissions.view' => ['Admin'],
            'settings.rbac_matrix.view' => ['Admin'],

            'process_bet' => ['Admin', 'Manager', 'Cashier Basic', 'Cashier Full'],
            'process_payout' => ['Admin', 'Manager', 'Cashier Full'],
            'void_bet' => ['Admin', 'Manager', 'Cashier Full'],
            'cash_in' => ['Admin', 'Manager', 'Cashier Basic', 'Cashier Full'],
            'cash_out' => ['Admin', 'Manager', 'Cashier Full'],
        ];

        foreach ($matrix as $permissionName => $roleNames) {
            $permission = Permission::query()->where('name', $permissionName)->first();
            if (! $permission) {
                continue;
            }

            foreach ($roleNames as $roleName) {
                $role = Role::query()->where('name', $roleName)->first();
                if (! $role) {
                    continue;
                }

                $role->permissions()->syncWithoutDetaching([$permission->id]);
            }
        }

        $admin = Role::query()->where('name', 'Admin')->first();
        if ($admin) {
            $allPermissionIds = Permission::query()->pluck('id')->all();
            $admin->permissions()->syncWithoutDetaching($allPermissionIds);
        }
    }
}
