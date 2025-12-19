<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FamilyRelation extends Model
{
    use HasFactory;

    protected $fillable = [
        'father_id',
        'mother_id',
        'child_id',
    ];

    public function father()
    {
        return $this->belongsTo(FamilyDataMember::class, 'father_id');
    }

    public function mother()
    {
        return $this->belongsTo(FamilyDataMember::class, 'mother_id');
    }

    public function child()
    {
        return $this->belongsTo(FamilyDataMember::class, 'child_id');
    }
}
