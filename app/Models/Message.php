<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;

class Message extends Model
{
    use Notifiable;

    protected $fillable = [
        'user_id',
        'family_tree_id',
        'phone',
        'tree_name',
        'type',
        'status',
    ];

    protected $appends = ['status_arabic', 'type_arabic'];

    public function getStatusArabicAttribute()
    {
        return match ($this->status) {
            'unanswered' => 'لم يتم الرد',
            'under_review' => 'تحت المراجعة',
            'answered' => 'تم الرد',
            default => $this->status,
        };
    }

    public function getTypeArabicAttribute()
    {
        return match ($this->type) {
            'complaint' => 'شكوى',
            'inquiry' => 'استفسار',
            default => $this->type,
        };
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function familytree()
    {
        return $this->belongsTo(\App\Models\FamilyTree::class, 'family_tree_id');
    }
}
