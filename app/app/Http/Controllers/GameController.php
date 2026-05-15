<?php

namespace App\Http\Controllers;

use App\Models\Cock;
use App\Models\FightingStyle;
use App\Models\Game;
use App\Models\GameMatch;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GameController extends Controller
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

        $matchSearch = trim((string) request()->query('matchSearch', ''));
        $matchPerPage = (int) request()->query('matchPerPage', 20);
        $matchPerPage = max(20, min(2000, $matchPerPage));
        $matchPerPage = (int) (floor($matchPerPage / 20) * 20);
        if ($matchPerPage < 20) {
            $matchPerPage = 20;
        }

        $cockSearch = trim((string) request()->query('cockSearch', ''));
        $cockPerPage = (int) request()->query('cockPerPage', 20);
        $cockPerPage = max(20, min(2000, $cockPerPage));
        $cockPerPage = (int) (floor($cockPerPage / 20) * 20);
        if ($cockPerPage < 20) {
            $cockPerPage = 20;
        }

        $cock2Search = trim((string) request()->query('cock2Search', ''));
        $cock2PerPage = (int) request()->query('cock2PerPage', 20);
        $cock2PerPage = max(20, min(2000, $cock2PerPage));
        $cock2PerPage = (int) (floor($cock2PerPage / 20) * 20);
        if ($cock2PerPage < 20) {
            $cock2PerPage = 20;
        }

        $games = Game::query()
            ->when($search !== '', function ($q) use ($search) {
                $q->where(function ($qq) use ($search) {
                    $qq->where('name', 'like', "%{$search}%")
                        ->orWhere('location', 'like', "%{$search}%")
                        ->orWhere('details1', 'like', "%{$search}%")
                        ->orWhere('details2', 'like', "%{$search}%");
                });
            })
            ->orderByDesc('date')
            ->orderByDesc('id')
            ->select([
                'id',
                'name',
                'location',
                'date',
                'details1',
                'details2',
            ])
            ->paginate($perPage)
            ->withQueryString();

        $matches = GameMatch::query()
            ->when($matchSearch !== '', function ($q) use ($matchSearch) {
                $q->where(function ($qq) use ($matchSearch) {
                    $qq->where('event_id', 'like', "%{$matchSearch}%")
                        ->orWhere('fight_number', 'like', "%{$matchSearch}%")
                        ->orWhere('status', 'like', "%{$matchSearch}%");
                });
            })
            ->with([
                'cock1.player:id,name',
                'cock1.fightingStyle:id,name',
                'cock2.player:id,name',
                'cock2.fightingStyle:id,name',
            ])
            ->orderByDesc('id')
            ->select([
                'id',
                'event_id',
                'event_name',
                'event_location',
                'event_details1',
                'event_details2',
                'event_date',
                'cock1_id',
                'cock2_id',
                'cock1_color',
                'cock2_color',
                'fight_number',
                'schedule_time',
                'status',
            ])
            ->paginate($matchPerPage, ['*'], 'matchPage')
            ->withQueryString();

        $cocks = Cock::query()
            ->when($cockSearch !== '', function ($q) use ($cockSearch) {
                $q->where(function ($qq) use ($cockSearch) {
                    $qq->where('code', 'like', "%{$cockSearch}%")
                        ->orWhere('cock_name', 'like', "%{$cockSearch}%")
                        ->orWhere('cock_alias', 'like', "%{$cockSearch}%")
                        ->orWhere('breed', 'like', "%{$cockSearch}%")
                        ->orWhere('color', 'like', "%{$cockSearch}%")
                        ->orWhere('status', 'like', "%{$cockSearch}%")
                        ->orWhere('player_id', 'like', "%{$cockSearch}%");
                });
            })
            ->orderByDesc('id')
            ->with(['fightingStyle:id,name'])
            ->select([
                'id',
                'player_id',
                'code',
                'cock_name',
                'cock_entry_number',
                'cock_alias',
                'cock_stand',
                'age',
                'hatch_date',
                'weight',
                'height',
                'breed',
                'color',
                'fighting_style_id',
                'wins',
                'draws',
                'losses',
                'status',
            ])
            ->paginate($cockPerPage, ['*'], 'cockPage')
            ->withQueryString();

        $cocks2 = Cock::query()
            ->when($cock2Search !== '', function ($q) use ($cock2Search) {
                $q->where(function ($qq) use ($cock2Search) {
                    $qq->where('code', 'like', "%{$cock2Search}%")
                        ->orWhere('cock_name', 'like', "%{$cock2Search}%")
                        ->orWhere('cock_alias', 'like', "%{$cock2Search}%")
                        ->orWhere('breed', 'like', "%{$cock2Search}%")
                        ->orWhere('color', 'like', "%{$cock2Search}%")
                        ->orWhere('status', 'like', "%{$cock2Search}%")
                        ->orWhere('player_id', 'like', "%{$cock2Search}%");
                });
            })
            ->orderByDesc('id')
            ->with(['fightingStyle:id,name'])
            ->select([
                'id',
                'player_id',
                'code',
                'cock_name',
                'cock_entry_number',
                'cock_alias',
                'cock_stand',
                'age',
                'hatch_date',
                'weight',
                'height',
                'breed',
                'color',
                'fighting_style_id',
                'wins',
                'draws',
                'losses',
                'status',
            ])
            ->paginate($cock2PerPage, ['*'], 'cock2Page')
            ->withQueryString();

        return Inertia::render('Games/Index', [
            'games' => $games,
            'matches' => $matches,
            'cocks' => $cocks,
            'cocks2' => $cocks2,
            'filters' => [
                'search' => $search,
                'perPage' => $perPage,
                'matchSearch' => $matchSearch,
                'matchPerPage' => $matchPerPage,
                'cockSearch' => $cockSearch,
                'cockPerPage' => $cockPerPage,
                'cock2Search' => $cock2Search,
                'cock2PerPage' => $cock2PerPage,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:200'],
            'location' => ['nullable', 'string', 'max:200'],
            'date' => ['nullable', 'date'],
            'details1' => ['nullable', 'string'],
            'details2' => ['nullable', 'string'],
        ]);

        Game::query()->create([
            'name' => $validated['name'],
            'location' => $validated['location'] ?? null,
            'date' => $validated['date'] ?? null,
            'details1' => $validated['details1'] ?? null,
            'details2' => $validated['details2'] ?? null,
        ]);

        return back(303);
    }

    public function update(Request $request, Game $game): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:200'],
            'location' => ['nullable', 'string', 'max:200'],
            'date' => ['nullable', 'date'],
            'details1' => ['nullable', 'string'],
            'details2' => ['nullable', 'string'],
        ]);

        $game->update([
            'name' => $validated['name'],
            'location' => $validated['location'] ?? null,
            'date' => $validated['date'] ?? null,
            'details1' => $validated['details1'] ?? null,
            'details2' => $validated['details2'] ?? null,
        ]);

        return back(303);
    }

    public function destroy(Game $game): RedirectResponse
    {
        $game->delete();

        return back(303);
    }
}
