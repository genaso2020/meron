<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Cock extends Model
{
    use HasFactory;

    protected $fillable = [
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
    ];

    protected $casts = [
        'weight' => 'decimal:2',
        'height' => 'decimal:2',
        'age' => 'integer',
        'hatch_date' => 'datetime',
        'wins' => 'integer',
        'draws' => 'integer',
        'losses' => 'integer',
    ];

    public function fightingStyle(): BelongsTo
    {
        return $this->belongsTo(FightingStyle::class);
    }

    public function player(): BelongsTo
    {
        return $this->belongsTo(Player::class);
    }
}
