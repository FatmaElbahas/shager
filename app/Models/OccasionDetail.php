<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OccasionDetail extends Model
{
    use HasFactory;

    protected $fillable = [
        'occasion_id',
        'title',
        'date',
        'description',
        'location_map',
        'tags',
        'images',
        'cover_image',
        'added_by'
    ];

    protected $casts = [
        'tags' => 'array',
        'images' => 'array',
        'date' => 'date',
    ];

    public function occasion()
    {
        return $this->belongsTo(Occasion::class);
    }
}
