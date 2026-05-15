<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(): Response
    {
        $search = trim((string) request()->query('search', ''));
        $perPage = (int) request()->query('perPage', 20);
        $perPage = max(20, min(2000, $perPage));
        $perPage = (int) (floor($perPage / 20) * 20);
        if ($perPage < 20) {
            $perPage = 20;
        }

        $users = User::query()
            ->with(['role:id,name,label'])
            ->when($search !== '', function ($q) use ($search) {
                $q->where(function ($qq) use ($search) {
                    $qq->where('first_name', 'like', "%{$search}%")
                        ->orWhere('middle_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('contact_no', 'like', "%{$search}%");
                });
            })
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->orderBy('name')
            ->select([
                'id',
                'first_name',
                'middle_name',
                'last_name',
                'name',
                'email',
                'contact_no',
                'frontend_themecolor',
                'photo_path',
                'role_id',
            ])
            ->paginate($perPage)
            ->withQueryString();

        $roles = Role::query()
            ->orderBy('name')
            ->get(['id', 'name', 'label']);

        return Inertia::render('Users/Index', [
            'users' => $users,
            'roles' => $roles,
            'filters' => [
                'search' => $search,
                'perPage' => $perPage,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:20'],
            'middle_name' => ['nullable', 'string', 'max:20'],
            'last_name' => ['required', 'string', 'max:20'],
            'email' => ['required', 'string', 'email', 'max:50', 'unique:users,email'],
            'role_id' => ['required', 'integer', 'exists:roles,id'],
            'password' => ['required', 'string', 'min:8'],
            'contact_no' => ['nullable', 'string', 'max:20', 'unique:users,contact_no'],
            'frontend_themecolor' => ['nullable', 'string', 'max:200'],
            'photo' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        $photoPath = null;
        if ($request->hasFile('photo')) {
            $photoPath = $request->file('photo')->store('user-photos', 'public');
        }

        $fullName = trim(implode(' ', array_filter([
            $validated['first_name'],
            $validated['middle_name'] ?? null,
            $validated['last_name'],
        ], fn ($v) => is_string($v) && trim($v) !== '')));

        User::query()->create([
            'first_name' => $validated['first_name'],
            'middle_name' => $validated['middle_name'] ?? null,
            'last_name' => $validated['last_name'],
            'name' => Str::limit($fullName, 60, ''),
            'email' => $validated['email'],
            'role_id' => (int) $validated['role_id'],
            'password' => Hash::make($validated['password']),
            'contact_no' => $validated['contact_no'] ?? null,
            'frontend_themecolor' => $validated['frontend_themecolor'] ?? null,
            'photo_path' => $photoPath,
        ]);

        return back(303);
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:20'],
            'middle_name' => ['nullable', 'string', 'max:20'],
            'last_name' => ['required', 'string', 'max:20'],
            'email' => [
                'required',
                'string',
                'email',
                'max:50',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
            'role_id' => ['required', 'integer', 'exists:roles,id'],
            'password' => ['nullable', 'string', 'min:8'],
            'contact_no' => [
                'nullable',
                'string',
                'max:20',
                Rule::unique('users', 'contact_no')->ignore($user->id),
            ],
            'frontend_themecolor' => ['nullable', 'string', 'max:200'],
            'photo' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        $photoPath = $user->photo_path;
        if ($request->hasFile('photo')) {
            $photoPath = $request->file('photo')->store('user-photos', 'public');
        }

        $fullName = trim(implode(' ', array_filter([
            $validated['first_name'],
            $validated['middle_name'] ?? null,
            $validated['last_name'],
        ], fn ($v) => is_string($v) && trim($v) !== '')));

        $user->first_name = $validated['first_name'];
        $user->middle_name = $validated['middle_name'] ?? null;
        $user->last_name = $validated['last_name'];
        $user->name = Str::limit($fullName, 60, '');
        $user->email = $validated['email'];
        $user->role_id = (int) $validated['role_id'];
        $user->contact_no = $validated['contact_no'] ?? null;
        $user->frontend_themecolor = $validated['frontend_themecolor'] ?? null;
        $user->photo_path = $photoPath;

        if (! empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        return back(303);
    }

    public function destroy(User $user): RedirectResponse
    {
        if (Auth::id() === $user->id) {
            return back(303)->withErrors([
                'users' => 'You cannot delete your own user account.',
            ]);
        }

        $user->delete();

        return back(303);
    }
}
