<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Game extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'location',
        'date',
        'details1',
        'details2',
    ];

    protected $casts = [
        'date' => 'date',
    ];
}
