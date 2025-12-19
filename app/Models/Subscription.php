<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    protected $fillable = [
        'user_id',
        'plan_id',
        'family_id',
        'family_tree_id',
        'status',
        'plan_type',
        'start_date',
        'end_date',
        'auto_renew'
    ];

    public function plan()
    {
        return $this->belongsTo(\App\Models\Plan::class);
    }


    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function family()
    {
        return $this->belongsTo(Family::class);
    }

    public function familyTree()
    {
        return $this->belongsTo(FamilyTree::class, 'family_tree_id');
    }
}
