<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FamilyCreatorMembers extends Model
{
    use HasFactory;

    protected $fillable = [
        'family_tree_id',
        'full_name',
        'email',
        'status',
        'joined_date',
        'membership_type',
        'notes',
        'avatar'
    ];

    public function familyTree()
    {
        return $this->belongsTo(FamilyTree::class);
    }
}
