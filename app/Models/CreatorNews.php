<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CreatorNews extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'family_tree_id',
        'title',
        'short_description',
        'full_description',
        'image',
        'published_at',
    ];

    protected $casts = [
        'published_at' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function comments()
    {
        return $this->hasMany(NewsComment::class);
    }

    public function FamilyTree()
    {
        return $this->belongsTo(FamilyTree::class);
    }

    public function getCoverImageUrlAttribute()
    {
        return $this->image
            ? '/storage/' . $this->image
            : null;
    }
}
