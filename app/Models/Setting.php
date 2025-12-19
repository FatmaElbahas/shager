<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    use HasFactory;

    protected $fillable = [
        'platform_logo',
        'platform_link',
        'platform_description',
        'default_language',
        'encryption_enabled',
        'security_provider_integration',
        'ssl_protection',
        'ddos_protection',
        'support_phone',
        'support_email',
        'facebook',
        'instagram',
        'twitter',
        'youtube'
    ];
}
