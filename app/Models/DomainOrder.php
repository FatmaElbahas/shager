<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DomainOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'payment_id',
        'status',
        'amount',
        'duration',
        'domains',
        'hosting',
        'customer_info',
        'coupon_code',
        'discount',
    ];

    protected $casts = [
        'domains' => 'array',
        'hosting' => 'array',
        'customer_info' => 'array',
        'amount' => 'decimal:2',
        'discount' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
