<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Occasion extends Model
{
    use HasFactory;

    protected $fillable = [
        'city',
        'longitude',
        'latitude',
        'family_tree_id',
        'user_id',
        'name',
        'occasion_date',
        'visibility',
        'category',
        'details',
        'cover_image',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }


    public function occasionDetails()
    {
        return $this->hasMany(OccasionDetail::class);
    }

    public function FamilyTree()
    {
        return $this->belongsTo(FamilyTree::class, 'family_tree_id');
    }

    public function getCoverImageUrlAttribute()
    {
        return $this->cover_image
            ? '/storage/' . $this->cover_image
            : null;
    }
}
