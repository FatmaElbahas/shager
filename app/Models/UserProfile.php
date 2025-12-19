<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'first_name',
        'last_name',
        'job',
        'birth_date',
        'social_status',
        'phone',
        'profile_image'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    protected $appends = ['profile_image_url'];


    public function getProfileImageUrlAttribute()
    {
        return $this->profile_image
            ? '/storage/' . $this->profile_image
            : '/images/default-profile.png';
    }
}
