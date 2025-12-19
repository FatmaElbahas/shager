<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FamilyMember extends Model
{
    protected $fillable = ['family_id', 'name', 'relation', 'email', 'added_by'];

    public function family()
    {
        return $this->belongsTo(Family::class);
    }

    public function addedByUser()
    {
        return $this->belongsTo(User::class, 'added_by');
    }


    // علاقة الأبناء
    public function children()
    {
        return $this->hasMany(FamilyRelation::class, 'parent_id');
    }

    // علاقة الآباء
    public function parents()
    {
        return $this->hasMany(FamilyRelation::class, 'child_id');
    }
}
