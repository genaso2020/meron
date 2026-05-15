<?php

use App\Models\Permission;
use App\Models\Role;
use App\Http\Controllers\CockController;
use App\Http\Controllers\GameController;
use App\Http\Controllers\MatchController;
use App\Http\Controllers\PlayerController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Settings\RoleController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    if (! Auth::check()) {
        return redirect()->route('login');
    }

    $user = Auth::user();
    if ($user && $user->role && in_array($user->role->name, ['Cashier-Basic', 'Cashier-Full', 'Cashier Basic', 'Cashier Full'], true)) {
        return redirect()->route('cashier.home');
    }

    return redirect()->route('dashboard');
});

Route::get('/cashier', function () {
    return Inertia::render('Cashier/Index');
})->middleware(['auth', 'role:Cashier-Basic,Cashier-Full,Cashier Basic,Cashier Full'])->name('cashier.home');

Route::get('/cashier/ui', function () {
    return view('landing');
})->middleware(['auth', 'role:Cashier-Basic,Cashier-Full,Cashier Basic,Cashier Full'])->name('cashier.ui');

Route::get('/lock', function (Request $request) {
    Auth::guard('web')->logout();
    $request->session()->invalidate();
    $request->session()->regenerateToken();

    return redirect()->route('login');
})->middleware('auth')->name('lock');

Route::get('/dashboard', function () {
    $user = Auth::user();
    if ($user && $user->role && in_array($user->role->name, ['Cashier-Basic', 'Cashier-Full', 'Cashier Basic', 'Cashier Full'], true)) {
        return redirect()->route('cashier.home');
    }

    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/reports', function () {
        return Inertia::render('Reports/Index');
    })->middleware('permission:reports.view')->name('reports');

    Route::get('/users', [UserController::class, 'index'])
        ->middleware('permission:users.view')
        ->name('users');

    Route::post('/users', [UserController::class, 'store'])
        ->middleware('permission:users.create')
        ->name('users.store');

    Route::put('/users/{user}', [UserController::class, 'update'])
        ->middleware('permission:users.update')
        ->name('users.update');

    Route::delete('/users/{user}', [UserController::class, 'destroy'])
        ->middleware('permission:users.delete')
        ->name('users.destroy');

    Route::get('/players', [PlayerController::class, 'index'])
        ->middleware('permission:players.view')
        ->name('players');

    Route::post('/players', [PlayerController::class, 'store'])
        ->middleware('permission:players.create')
        ->name('players.store');

    Route::put('/players/{player}', [PlayerController::class, 'update'])
        ->middleware('permission:players.update')
        ->name('players.update');

    Route::delete('/players/{player}', [PlayerController::class, 'destroy'])
        ->middleware('permission:players.delete')
        ->name('players.destroy');

    Route::get('/cocks', [CockController::class, 'index'])
        ->middleware('permission:cocks.view')
        ->name('cocks');

    Route::post('/cocks', [CockController::class, 'store'])
        ->middleware('permission:cocks.create')
        ->name('cocks.store');

    Route::put('/cocks/{cock}', [CockController::class, 'update'])
        ->middleware('permission:cocks.update')
        ->name('cocks.update');

    Route::delete('/cocks/{cock}', [CockController::class, 'destroy'])
        ->middleware('permission:cocks.delete')
        ->name('cocks.destroy');

    Route::get('/games', [GameController::class, 'index'])
        ->middleware('permission:games.view')
        ->name('games');

    Route::post('/games', [GameController::class, 'store'])
        ->middleware('permission:games.create')
        ->name('games.store');

    Route::put('/games/{game}', [GameController::class, 'update'])
        ->middleware('permission:games.update')
        ->name('games.update');

    Route::delete('/games/{game}', [GameController::class, 'destroy'])
        ->middleware('permission:games.delete')
        ->name('games.destroy');

    Route::post('/matches', [MatchController::class, 'store'])
        ->middleware('permission:matches.create')
        ->name('matches.store');

    Route::put('/matches/{match}', [MatchController::class, 'update'])
        ->middleware('permission:matches.update')
        ->name('matches.update');

    Route::delete('/matches/{match}', [MatchController::class, 'destroy'])
        ->middleware('permission:matches.delete')
        ->name('matches.destroy');

    Route::get('/matches', function () {
        return Inertia::render('Matches/Index');
    })->middleware('permission:matches.view')->name('matches');

    Route::get('/bets', function () {
        return Inertia::render('Bets/Index');
    })->middleware('permission:bets.view')->name('bets');

    Route::get('/settings/roles', [RoleController::class, 'index'])
        ->middleware('permission:settings.roles.view')
        ->name('settings.roles');

    Route::post('/settings/roles', [RoleController::class, 'store'])
        ->middleware('permission:settings.roles.create')
        ->name('settings.roles.store');

    Route::put('/settings/roles/{role}', [RoleController::class, 'update'])
        ->middleware('permission:settings.roles.update')
        ->name('settings.roles.update');

    Route::delete('/settings/roles/{role}', [RoleController::class, 'destroy'])
        ->middleware('permission:settings.roles.delete')
        ->name('settings.roles.destroy');

    Route::get('/settings/permissions', function () {
        return Inertia::render('Settings/Permissions');
    })->middleware('permission:settings.permissions.view')->name('settings.permissions');

    Route::get('/settings/rbac-matrix', function () {
        $roles = Role::query()
            ->orderBy('name')
            ->with(['permissions:id'])
            ->get(['id', 'name', 'label']);

        $permissions = Permission::query()
            ->orderBy('category')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get(['id', 'name', 'label', 'category', 'sort_order']);

        $matrix = $roles->mapWithKeys(function (Role $role) {
            return [$role->id => $role->permissions->pluck('id')->values()];
        });

        return Inertia::render('Settings/RbacMatrix', [
            'roles' => $roles,
            'permissions' => $permissions,
            'matrix' => $matrix,
        ]);
    })->middleware('permission:settings.rbac_matrix.view')->name('settings.rbac_matrix');

    Route::post('/settings/rbac-matrix/toggle', function (Request $request) {
        $validated = $request->validate([
            'role_id' => ['required', 'integer', 'exists:roles,id'],
            'permission_id' => ['required', 'integer', 'exists:permissions,id'],
            'enabled' => ['required', 'boolean'],
        ]);

        $role = Role::query()->findOrFail($validated['role_id']);
        $permissionId = (int) $validated['permission_id'];

        if ($validated['enabled']) {
            $role->permissions()->syncWithoutDetaching([$permissionId]);
        } else {
            $role->permissions()->detach([$permissionId]);
        }

        return back(303);
    })->middleware('permission:settings.rbac_matrix.view')->name('settings.rbac_matrix.toggle');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
