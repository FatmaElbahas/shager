<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    use HasFactory;

    protected $fillable = [
        'logo',
        'discount_value',
        'expiry_date',
        'is_active',
        'code',
        'client_discount_type',
        'product_discount_type',
        'start_date',
        'end_date',
        'usage_limit_total',
        'usage_limit_per_user',
    ];
}
