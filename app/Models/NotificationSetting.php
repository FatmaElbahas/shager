<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NotificationSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'new_member',
        'new_news',
        'password_changed',
        'complaint_received',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
