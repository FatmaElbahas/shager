<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FamilyTree extends Model
{
    use HasFactory;

    protected $fillable = [
        'template_id',
        'user_id',
        'tree_name',
        'cover_image',
        'logo_image',
        'is_default'
    ];

    public function template()
    {
        return $this->belongsTo(TreeTemplate::class, 'template_id');
    }

    public function activities()
    {
        return $this->hasMany(Activity::class);
    }

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class, 'family_tree_id');
    }

    public function getImageUrlAttribute()
    {
        return $this->image
            ? '/storage/' . $this->image
            : '/storage/default_images/tree 1.png';
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function events()
    {
        return $this->hasMany(Event::class);
    }

    public function news()
    {
        return $this->hasMany(News::class);
    }

    public function creatornews()
    {
        return $this->hasMany(CreatorNews::class);
    }

    public function familyDataMembers()
    {
        return $this->hasMany(familyDataMember::class);
    }

    public function message()
    {
        return $this->hasmany(message::class);
    }

    public function complaints()
    {
        return $this->hasmany(Complaint::class);
    }


    public function subs()
    {
        return $this->hasmany(Subscription::class);
    }
}
