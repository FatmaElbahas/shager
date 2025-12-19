<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Permission extends Model
{
    protected $fillable = [
        'plan_id',
        'permission_id',
        'template_id'
    ];

    public function plans()
    {
        return $this->belongsToMany(Plan::class, 'plan_permission');
    }
    public function templates()
    {
        return $this->belongsToMany(TreeTemplate::class, 'plan_template', 'plan_id', 'template_id');
    }
}
