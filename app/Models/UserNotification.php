<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserNotification extends Model
{
    protected $fillable = ['user_id', 'message', 'date', 'time', 'icon'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
