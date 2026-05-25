<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ActiveMatchController extends Controller
{
    private function buildCockPayload(?object $cock, ?string $fightingStyleName = null): ?array
    {
        if (! $cock) {
            return null;
        }

        $recordParts = [];
        if (property_exists($cock, 'wins')) {
            $recordParts[] = (string) ($cock->wins ?? 0);
        }
        if (property_exists($cock, 'losses')) {
            $recordParts[] = (string) ($cock->losses ?? 0);
        }
        if (property_exists($cock, 'draws')) {
            $recordParts[] = (string) ($cock->draws ?? 0);
        }

        return [
            'id' => $cock->id ?? null,
            'name' => $cock->cock_name ?? $cock->cock_alias ?? $cock->code ?? null,
            'alias' => $cock->cock_alias ?? null,
            'entry_number' => $cock->cock_entry_number ?? null,
            'stand' => $cock->cock_stand ?? null,
            'color' => $cock->color ?? null,
            'breed' => $cock->breed ?? null,
            'weight' => $cock->weight ?? null,
            'height' => $cock->height ?? null,
            'age' => $cock->age ?? null,
            'origin' => $cock->origin ?? null,
            'fighting_style' => $fightingStyleName,
            'record' => count($recordParts) ? implode('-', $recordParts) : null,
            'photo_path' => $cock->photo_path ?? null,
            'front_photo_path' => $cock->front_photo_path ?? null,
            'left_photo_path' => $cock->left_photo_path ?? null,
            'right_photo_path' => $cock->right_photo_path ?? null,
            'action_photo_path' => $cock->action_photo_path ?? null,
        ];
    }

    private function withCockDetails(object $match): array
    {
        $cockIds = [];
        if (! empty($match->cock1_id)) {
            $cockIds[] = (int) $match->cock1_id;
        }
        if (! empty($match->cock2_id)) {
            $cockIds[] = (int) $match->cock2_id;
        }

        $cocksById = new Collection();
        $stylesById = new Collection();

        if (count($cockIds)) {
            $cocksById = DB::table('cocks')
                ->whereIn('id', $cockIds)
                ->get()
                ->keyBy('id');

            $styleIds = $cocksById
                ->pluck('fighting_style_id')
                ->filter(fn ($v) => $v !== null)
                ->unique()
                ->values();

            if ($styleIds->count()) {
                $stylesById = DB::table('fighting_styles')
                    ->whereIn('id', $styleIds->all())
                    ->get()
                    ->keyBy('id');
            }
        }

        $payload = (array) $match;

        $cock1 = $cocksById->get((int) ($match->cock1_id ?? 0));
        $cock2 = $cocksById->get((int) ($match->cock2_id ?? 0));

        $payload['cock1'] = $this->buildCockPayload(
            $cock1,
            $cock1?->fighting_style_id ? ($stylesById->get((int) $cock1->fighting_style_id)?->name) : null
        );
        $payload['cock2'] = $this->buildCockPayload(
            $cock2,
            $cock2?->fighting_style_id ? ($stylesById->get((int) $cock2->fighting_style_id)?->name) : null
        );

        return $payload;
    }

    public function show()
    {
        $match = DB::table('matches')
            ->where('status', 'active')
            ->orderByDesc('updated_at')
            ->first();

        if (! $match) {
            return response()->json([
                'message' => "No active match found (matches.status = 'active').",
            ], 404);
        }

        return response()->json($this->withCockDetails($match));
    }

    public function stream(Request $request)
    {
        $response = new StreamedResponse(function () {
            $lastUpdatedAt = null;
            $lastPingAt = time();

            echo "retry: 1500\n\n";
            @ob_flush();
            @flush();

            while (true) {
                if (connection_aborted()) {
                    break;
                }

                $match = DB::table('matches')
                    ->where('status', 'active')
                    ->orderByDesc('updated_at')
                    ->first();

                $currentUpdatedAt = $match?->updated_at;

                if ($currentUpdatedAt !== $lastUpdatedAt) {
                    $lastUpdatedAt = $currentUpdatedAt;

                    $payload = json_encode($match ? $this->withCockDetails($match) : null);

                    echo "event: active_match\n";
                    echo "data: {$payload}\n\n";

                    @ob_flush();
                    @flush();
                }

                if ((time() - $lastPingAt) >= 15) {
                    $lastPingAt = time();
                    echo ": ping\n\n";
                    @ob_flush();
                    @flush();
                }

                usleep(1000 * 1000);
            }
        });

        $response->headers->set('Content-Type', 'text/event-stream');
        $response->headers->set('Cache-Control', 'no-cache, no-store, must-revalidate');
        $response->headers->set('Connection', 'keep-alive');

        return $response;
    }
}
