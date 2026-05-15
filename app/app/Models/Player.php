<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Player extends Model
{
    protected $fillable = [
        'first_name',
        'middle_name',
        'last_name',
        'contact_no',
        'address',
        'status',
    ];
}
