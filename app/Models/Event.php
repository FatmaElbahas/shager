<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    protected $fillable = ['family_id', 'title', 'type', 'event_date', 'description'];

    public function familytree()
    {
        return $this->belongsTo(FamilyTree::class);
    }
}
