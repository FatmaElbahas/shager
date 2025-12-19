<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TreeCreatorEvent extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'event_type',
        'person_name',
        'event_date',
        'details',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
