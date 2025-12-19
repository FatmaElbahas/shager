<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Complaint extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'title', 'type', 'details', 'attachment', 'family_tree_id', 'admin_reply', 'status'];

    

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function familyTree()
    {
        return $this->belongsTo(\App\Models\FamilyTree::class, 'family_tree_id');
    }
}
