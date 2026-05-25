<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Bet extends Model
{
    use HasFactory;

    protected $fillable = [
        'match_id',
        'user_id',
        'no_of_bets',
        'amount',
        'side',
        'odds',
        'potential_payout',
        'status',
    ];

    protected $casts = [
        'no_of_bets' => 'integer',
        'amount' => 'decimal:2',
        'odds' => 'decimal:4',
        'potential_payout' => 'decimal:2',
    ];

    public function match(): BelongsTo
    {
        return $this->belongsTo(GameMatch::class, 'match_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
