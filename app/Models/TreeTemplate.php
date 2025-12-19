<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TreeTemplate extends Model
{
    protected $fillable = ['name', 'image', 'description'];

    protected $appends = ['image_url'];
    public function getImageUrlAttribute()
    {
        return $this->image ? '/storage/' . $this->image : null;
    }

    public function familyTrees()
    {
        return $this->hasMany(FamilyTree::class, 'template_id');
    }
    public function plans()
    {
        return $this->belongsToMany(Permission::class, 'template_id', 'plan_id');
    }
}
