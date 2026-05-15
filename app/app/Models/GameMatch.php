<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GameMatch extends Model
{
    use HasFactory;

    protected $table = 'matches';

    protected $fillable = [
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
    ];

    protected $casts = [
        'fight_number' => 'integer',
        'schedule_time' => 'datetime',
        'event_date' => 'date',
    ];

    public function cock1(): BelongsTo
    {
        return $this->belongsTo(Cock::class, 'cock1_id');
    }

    public function cock2(): BelongsTo
    {
        return $this->belongsTo(Cock::class, 'cock2_id');
    }
}
