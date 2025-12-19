<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FamilyDataMember extends Model
{
    use HasFactory;

    protected $table = 'family_data_members';

    protected $fillable = [
        'user_id',
        'family_tree_id',
        'relation',
        'name',
        'job',
        'status',
        'birth_date',
        'marital_status',
        'phone_number',
        'profile_picture',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function familyTree()
    {
        return $this->belongsTo(FamilyTree::class);
    }

    // العلاقة مع الأب
    public function fatherRelation()
    {
        return $this->hasOne(FamilyRelation::class, 'child_id')->with('father');
    }

    // العلاقة مع الأم
    public function motherRelation()
    {
        return $this->hasOne(FamilyRelation::class, 'child_id')->with('mother');
    }

    // الأبناء
    public function childrenRelations()
    {
        return $this->hasMany(FamilyRelation::class, 'father_id')
            ->orWhere('mother_id', $this->id)
            ->with('child');
    }
}
