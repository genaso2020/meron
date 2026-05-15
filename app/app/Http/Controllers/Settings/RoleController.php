<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\Role;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RoleController extends Controller
{
    public function index(): Response
    {
        $roles = Role::query()
            ->withCount('users')
            ->orderBy('name')
            ->get(['id', 'name', 'label']);

        return Inertia::render('Settings/Roles', [
            'roles' => $roles,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:50', 'unique:roles,name'],
            'label' => ['nullable', 'string', 'max:100'],
        ]);

        Role::query()->create([
            'name' => $validated['name'],
            'label' => $validated['label'] ?? $validated['name'],
        ]);

        return back(303);
    }

    public function update(Request $request, Role $role): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:50', 'unique:roles,name,'.$role->id],
            'label' => ['nullable', 'string', 'max:100'],
        ]);

        $role->update([
            'name' => $validated['name'],
            'label' => $validated['label'] ?? $validated['name'],
        ]);

        return back(303);
    }

    public function destroy(Role $role): RedirectResponse
    {
        if ($role->users()->exists()) {
            return back(303)->withErrors([
                'roles' => 'Cannot delete a role that is assigned to users.',
            ]);
        }

        $role->permissions()->detach();
        $role->delete();

        return back(303);
    }
}
