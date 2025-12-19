<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;


    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'profile_picture',
        'phone',
        'job',
        'status',
        'membership_type',
        'birth_date',
        'social_status',
        'life_status',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'birth_date' => 'date',
    ];

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }

    public function activities()
    {
        return $this->hasMany(Activity::class);
    }

    public function profile()
    {
        return $this->hasOne(UserProfile::class);
    }


    public function notificationSetting()
    {
        return $this->hasOne(NotificationSetting::class);
    }

    public function paymentCards()
    {
        return $this->hasMany(PaymentCard::class);
    }
    public function familyDataMembers()
    {
        return $this->hasMany(FamilyDataMember::class, 'user_id');
    }
    public function events()
    {
        return $this->hasMany(TreeCreatorEvent::class, 'user_id');
    }

    public function occasions()
    {
        return $this->hasMany(Occasion::class, 'user_id');
    }

    public function occasionDetails()
    {
        return $this->hasManyThrough(OccasionDetail::class, Occasion::class);
    }

    public function familyMapLocations()
    {
        return $this->hasMany(FamilyMapLocation::class);
    }

    public function notifications()
    {
        return $this->hasMany(UserNotification::class);
    }

    public function monthlyEvents()
    {
        return $this->hasMany(MonthlyEvent::class);
    }

    public function sentMessages()
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    public function receivedMessages()
    {
        return $this->hasMany(Message::class, 'receiver_id');
    }

    public function familyTrees()
    {
        return $this->hasMany(FamilyTree::class);
    }

    public function invitations()
    {
        return $this->hasMany(Invitation::class);
    }
}
