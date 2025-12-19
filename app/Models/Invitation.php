<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Invitation extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'invite_code',
        'usage_count',
        'sending_date',
        'status',
        'permission',
        'usage_limit',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function getInviteLinkAttribute()
    {
        return url('/invite/' . $this->invite_code);
    }
}
