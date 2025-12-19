<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CreatorFamilyTree extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'family_name', 'cover_image', 'family_logo'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function members()
    {
        return $this->hasMany(FamilyCreatorMembers::class);
    }
}
