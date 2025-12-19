<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class News extends Model
{
    protected $table = 'news';

    protected $fillable = ['family_id', 'title', 'content', 'image'];

    public function FamilyTree()
    {
        return $this->belongsTo(FamilyTree::class);
    }
}
