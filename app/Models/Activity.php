<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Activity extends Model
{
    protected $fillable = ['type', 'user_id', 'status', 'family_tree_id', 'user_name', 'user_email', 'user_phone', 'family_name', 'user_message', 'user_birth_date', 'user_social_status', 'user_job', 'plan_id'];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function plan()
    {
        return $this->belongsTo(\App\Models\Plan::class);
    }

    public function family()
    {
        return $this->belongsTo(FamilyTree::class, 'family_tree_id');
    }

    protected $appends = ['status_ar'];

    // ترجمة الحالات
    private $statusTranslation = [
        'pending' => 'قيد الانتظار',
        'reviewed' => 'تم المراجعة',
        'approving' => 'تم الموافقة',
        'rejected' => 'مرفوض',
    ];

    // Accessor لإرجاع الترجمة
    public function getStatusArAttribute()
    {
        return $this->statusTranslation[$this->status] ?? $this->status;
    }
}
