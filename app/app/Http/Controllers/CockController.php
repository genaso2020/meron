<?php

namespace App\Http\Controllers;

use App\Models\Cock;
use App\Models\FightingStyle;
use App\Models\Player;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CockController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));
        $perPage = (int) $request->query('perPage', 20);
        $perPage = max(20, min(2000, $perPage));
        $perPage = (int) (floor($perPage / 20) * 20);
        if ($perPage < 20) {
            $perPage = 20;
        }

        $cocks = Cock::query()
            ->when($search !== '', function ($q) use ($search) {
                $q->where(function ($qq) use ($search) {
                    $qq->where('code', 'like', "%{$search}%")
                        ->orWhere('cock_name', 'like', "%{$search}%")
                        ->orWhere('cock_alias', 'like', "%{$search}%")
                        ->orWhere('cock_stand', 'like', "%{$search}%")
                        ->orWhere('color', 'like', "%{$search}%")
                        ->orWhere('breed', 'like', "%{$search}%")
                        ->orWhere('origin', 'like', "%{$search}%");
                });
            })
            ->orderBy('cock_name')
            ->orderBy('id', 'desc')
            ->with([
                'fightingStyle:id,name',
                'player:id,first_name,middle_name,last_name',
            ])
            ->select([
                'id',
                'player_id',
                'code',
                'cock_name',
                'cock_entry_number',
                'cock_alias',
                'cock_stand',
                'color',
                'breed',
                'weight',
                'height',
                'age',
                'hatch_date',
                'origin',
                'fighting_style_id',
                'wins',
                'draws',
                'losses',
                'photo_path',
                'front_photo_path',
                'left_photo_path',
                'right_photo_path',
                'action_photo_path',
                'status',
            ])
            ->paginate($perPage)
            ->withQueryString();

        $fightingStyles = FightingStyle::query()
            ->orderBy('name')
            ->get(['id', 'name']);

        $players = Player::query()
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->orderBy('id')
            ->get(['id', 'first_name', 'middle_name', 'last_name']);

        return Inertia::render('Cocks/Index', [
            'cocks' => $cocks,
            'fightingStyles' => $fightingStyles,
            'players' => $players,
            'filters' => [
                'search' => $search,
                'perPage' => $perPage,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'player_id' => ['nullable', 'integer', 'min:1'],
            'code' => ['required', 'string', 'max:20'],
            'cock_name' => ['nullable', 'string', 'max:200'],
            'cock_entry_number' => ['nullable', 'integer', 'min:0'],
            'cock_alias' => ['nullable', 'string', 'max:200'],
            'cock_stand' => ['nullable', 'string', 'max:200'],
            'color' => ['nullable', 'string', 'max:200'],
            'breed' => ['nullable', 'string', 'max:200'],
            'weight' => ['nullable', 'numeric', 'min:0'],
            'height' => ['nullable', 'numeric', 'min:0'],
            'age' => ['nullable', 'integer', 'min:0'],
            'hatch_date' => ['nullable', 'date'],
            'origin' => ['nullable', 'string', 'max:200'],
            'fighting_style' => ['nullable', 'string', 'max:200'],
            'wins' => ['nullable', 'integer', 'min:0'],
            'draws' => ['nullable', 'integer', 'min:0'],
            'losses' => ['nullable', 'integer', 'min:0'],
            'photo' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'front_photo' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'left_photo' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'right_photo' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'action_photo' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'status' => ['required', Rule::in(['active', 'in-active'])],
        ]);

        $computedAge = 0;
        if (!empty($validated['hatch_date'])) {
            $computedAge = Carbon::parse($validated['hatch_date'])->diffInYears(Carbon::now());
        }

        $fightingStyleId = null;
        $styleName = trim((string) ($validated['fighting_style'] ?? ''));
        if ($styleName !== '') {
            $style = FightingStyle::query()->firstOrCreate(['name' => $styleName]);
            $fightingStyleId = $style->id;
        }

        $photoPath = null;
        if ($request->hasFile('photo')) {
            $photoPath = $request->file('photo')->store('cock-photos', 'public');
        }

        $frontPhotoPath = null;
        if ($request->hasFile('front_photo')) {
            $frontPhotoPath = $request->file('front_photo')->store('cock-photos', 'public');
        }

        $leftPhotoPath = null;
        if ($request->hasFile('left_photo')) {
            $leftPhotoPath = $request->file('left_photo')->store('cock-photos', 'public');
        }

        $rightPhotoPath = null;
        if ($request->hasFile('right_photo')) {
            $rightPhotoPath = $request->file('right_photo')->store('cock-photos', 'public');
        }

        $actionPhotoPath = null;
        if ($request->hasFile('action_photo')) {
            $actionPhotoPath = $request->file('action_photo')->store('cock-photos', 'public');
        }

        Cock::query()->create([
            'player_id' => $validated['player_id'] ?? null,
            'code' => $validated['code'],
            'cock_name' => $validated['cock_name'] ?? null,
            'cock_entry_number' => $validated['cock_entry_number'] ?? null,
            'cock_alias' => $validated['cock_alias'] ?? null,
            'cock_stand' => $validated['cock_stand'] ?? null,
            'color' => $validated['color'] ?? null,
            'breed' => $validated['breed'] ?? null,
            'weight' => $validated['weight'] ?? 0,
            'height' => $validated['height'] ?? 0,
            'age' => $computedAge,
            'hatch_date' => $validated['hatch_date'] ?? null,
            'origin' => $validated['origin'] ?? null,
            'fighting_style_id' => $fightingStyleId,
            'wins' => $validated['wins'] ?? 0,
            'draws' => $validated['draws'] ?? 0,
            'losses' => $validated['losses'] ?? 0,
            'photo_path' => $photoPath,
            'front_photo_path' => $frontPhotoPath,
            'left_photo_path' => $leftPhotoPath,
            'right_photo_path' => $rightPhotoPath,
            'action_photo_path' => $actionPhotoPath,
            'status' => $validated['status'],
        ]);

        return back(303);
    }

    public function update(Request $request, Cock $cock): RedirectResponse
    {
        $validated = $request->validate([
            'player_id' => ['nullable', 'integer', 'min:1'],
            'code' => ['required', 'string', 'max:20'],
            'cock_name' => ['nullable', 'string', 'max:200'],
            'cock_entry_number' => ['nullable', 'integer', 'min:0'],
            'cock_alias' => ['nullable', 'string', 'max:200'],
            'cock_stand' => ['nullable', 'string', 'max:200'],
            'color' => ['nullable', 'string', 'max:200'],
            'breed' => ['nullable', 'string', 'max:200'],
            'weight' => ['nullable', 'numeric', 'min:0'],
            'height' => ['nullable', 'numeric', 'min:0'],
            'age' => ['nullable', 'integer', 'min:0'],
            'hatch_date' => ['nullable', 'date'],
            'origin' => ['nullable', 'string', 'max:200'],
            'fighting_style' => ['nullable', 'string', 'max:200'],
            'wins' => ['nullable', 'integer', 'min:0'],
            'draws' => ['nullable', 'integer', 'min:0'],
            'losses' => ['nullable', 'integer', 'min:0'],
            'photo' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'front_photo' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'left_photo' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'right_photo' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'action_photo' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'status' => ['required', Rule::in(['active', 'in-active'])],
        ]);

        $update = [
            'code' => $validated['code'],
            'status' => $validated['status'],
        ];

        foreach ([
            'player_id',
            'cock_name',
            'cock_entry_number',
            'cock_alias',
            'cock_stand',
            'color',
            'breed',
            'weight',
            'height',
            'origin',
            'wins',
            'draws',
            'losses',
        ] as $field) {
            if (array_key_exists($field, $validated)) {
                $update[$field] = $validated[$field];
            }
        }

        if (array_key_exists('hatch_date', $validated)) {
            $update['hatch_date'] = $validated['hatch_date'] ?? null;
            $update['age'] = !empty($validated['hatch_date'])
                ? Carbon::parse($validated['hatch_date'])->diffInYears(Carbon::now())
                : 0;
        }

        if (array_key_exists('fighting_style', $validated)) {
            $styleName = trim((string) ($validated['fighting_style'] ?? ''));
            if ($styleName !== '') {
                $style = FightingStyle::query()->firstOrCreate(['name' => $styleName]);
                $update['fighting_style_id'] = $style->id;
            } else {
                $update['fighting_style_id'] = null;
            }
        }

        if ($request->hasFile('photo')) {
            $update['photo_path'] = $request->file('photo')->store('cock-photos', 'public');
        }

        if ($request->hasFile('front_photo')) {
            $update['front_photo_path'] = $request->file('front_photo')->store('cock-photos', 'public');
        }

        if ($request->hasFile('left_photo')) {
            $update['left_photo_path'] = $request->file('left_photo')->store('cock-photos', 'public');
        }

        if ($request->hasFile('right_photo')) {
            $update['right_photo_path'] = $request->file('right_photo')->store('cock-photos', 'public');
        }

        if ($request->hasFile('action_photo')) {
            $update['action_photo_path'] = $request->file('action_photo')->store('cock-photos', 'public');
        }

        $cock->update($update);

        return back(303);
    }

    public function destroy(Cock $cock): RedirectResponse
    {
        $cock->delete();

        return back(303);
    }
}
