<?php

namespace App\Http\Controllers;

use App\Models\Cock;
use App\Models\Game;
use App\Models\GameMatch;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Rule;

class MatchController extends Controller
{
    private function assertCockEntryNumbersAreUniqueWithinEvent(int $eventId, ?int $cock1Id, ?int $cock2Id, ?int $ignoreMatchId = null): void
    {
        $cock1Entry = null;
        $cock2Entry = null;

        if ($cock1Id) {
            $cock1Entry = Cock::query()->whereKey($cock1Id)->value('cock_entry_number');
        }

        if ($cock2Id) {
            $cock2Entry = Cock::query()->whereKey($cock2Id)->value('cock_entry_number');
        }

        if (!$cock1Entry && !$cock2Entry) {
            return;
        }

        $query = GameMatch::query()->where('event_id', $eventId);
        if ($ignoreMatchId) {
            $query->where('id', '!=', $ignoreMatchId);
        }

        if ($cock1Entry) {
            $used = (clone $query)
                ->where(function ($q) use ($cock1Entry) {
                    $q->whereHas('cock1', fn ($qq) => $qq->where('cock_entry_number', $cock1Entry))
                        ->orWhereHas('cock2', fn ($qq) => $qq->where('cock_entry_number', $cock1Entry));
                })
                ->exists();

            if ($used) {
                throw ValidationException::withMessages([
                    'cock1_id' => ['Cock Entry # is already used in this event.'],
                ]);
            }
        }

        if ($cock2Entry) {
            $used = (clone $query)
                ->where(function ($q) use ($cock2Entry) {
                    $q->whereHas('cock1', fn ($qq) => $qq->where('cock_entry_number', $cock2Entry))
                        ->orWhereHas('cock2', fn ($qq) => $qq->where('cock_entry_number', $cock2Entry));
                })
                ->exists();

            if ($used) {
                throw ValidationException::withMessages([
                    'cock2_id' => ['Cock Entry # is already used in this event.'],
                ]);
            }
        }
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'event_id' => ['required', 'integer', 'exists:games,id'],
            'cock1_id' => ['nullable', 'integer', 'exists:cocks,id', 'different:cock2_id'],
            'cock2_id' => ['nullable', 'integer', 'exists:cocks,id', 'different:cock1_id'],
            'cock1_color' => ['nullable', 'string', Rule::in(['WHITE', 'RED'])],
            'cock2_color' => ['nullable', 'string', Rule::in(['WHITE', 'RED'])],
            'fight_number' => ['required', 'integer', 'min:0'],
            'schedule_time' => ['nullable', 'date'],
            'status' => ['required', Rule::in(['pending', 'ongoing', 'done'])],
        ]);

        $eventId = (int) $validated['event_id'];
        $game = Game::query()->findOrFail($eventId);

        $cock1Id = array_key_exists('cock1_id', $validated) ? (int) ($validated['cock1_id'] ?? 0) : 0;
        $cock2Id = array_key_exists('cock2_id', $validated) ? (int) ($validated['cock2_id'] ?? 0) : 0;
        $this->assertCockEntryNumbersAreUniqueWithinEvent($eventId, $cock1Id ?: null, $cock2Id ?: null);

        GameMatch::query()->create([
            'event_id' => $eventId,
            'event_name' => $game->name,
            'event_location' => $game->location,
            'event_details1' => $game->details1,
            'event_details2' => $game->details2,
            'event_date' => $game->date,
            'cock1_id' => $cock1Id ?: null,
            'cock2_id' => $cock2Id ?: null,
            'cock1_color' => $validated['cock1_color'] ?? null,
            'cock2_color' => $validated['cock2_color'] ?? null,
            'fight_number' => (int) $validated['fight_number'],
            'schedule_time' => $validated['schedule_time'] ?? null,
            'status' => $validated['status'],
        ]);

        return back(303);
    }

    public function update(Request $request, GameMatch $match): RedirectResponse
    {
        $validated = $request->validate([
            'event_id' => ['required', 'integer', 'exists:games,id'],
            'cock1_id' => ['nullable', 'integer', 'exists:cocks,id', 'different:cock2_id'],
            'cock2_id' => ['nullable', 'integer', 'exists:cocks,id', 'different:cock1_id'],
            'cock1_color' => ['nullable', 'string', Rule::in(['WHITE', 'RED'])],
            'cock2_color' => ['nullable', 'string', Rule::in(['WHITE', 'RED'])],
            'fight_number' => ['required', 'integer', 'min:0'],
            'schedule_time' => ['nullable', 'date'],
            'status' => ['required', Rule::in(['pending', 'ongoing', 'done'])],
        ]);

        $eventId = (int) $validated['event_id'];
        $game = Game::query()->findOrFail($eventId);

        $cock1Id = array_key_exists('cock1_id', $validated) ? (int) ($validated['cock1_id'] ?? 0) : 0;
        $cock2Id = array_key_exists('cock2_id', $validated) ? (int) ($validated['cock2_id'] ?? 0) : 0;
        $this->assertCockEntryNumbersAreUniqueWithinEvent($eventId, $cock1Id ?: null, $cock2Id ?: null, (int) $match->id);

        $match->update([
            'event_id' => $eventId,
            'event_name' => $game->name,
            'event_location' => $game->location,
            'event_details1' => $game->details1,
            'event_details2' => $game->details2,
            'event_date' => $game->date,
            'cock1_id' => $cock1Id ?: null,
            'cock2_id' => $cock2Id ?: null,
            'cock1_color' => $validated['cock1_color'] ?? null,
            'cock2_color' => $validated['cock2_color'] ?? null,
            'fight_number' => (int) $validated['fight_number'],
            'schedule_time' => $validated['schedule_time'] ?? null,
            'status' => $validated['status'],
        ]);

        return back(303);
    }

    public function destroy(GameMatch $match): RedirectResponse
    {
        $match->delete();

        return back(303);
    }
}
