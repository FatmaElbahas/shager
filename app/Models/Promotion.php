<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Promotion extends Model
{
    use HasFactory;

    protected $fillable = [
        'background_image',
        'title',
        'start_date',
        'end_date',
        'is_active',
        'discount_type',
        'discount_value',
        'message',
    ];
}
