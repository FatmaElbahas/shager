<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\FamilyMember;

class Family extends Model
{
    protected $fillable = ['name', 'cover_image', 'logo'];

    public function members()
    {
        return $this->hasMany(FamilyMember::class);
    }

    public function events()
    {
        return $this->hasMany(Event::class);
    }

    public function news()
    {
        return $this->hasMany(News::class);
    }


    public function familyDataMembers()
    {
        return $this->hasMany(FamilyDataMember::class, 'family_id');
    }
}
