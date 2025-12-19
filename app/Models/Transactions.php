<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transactions extends Model
{
    protected $fillable = [
        'user_id',
        'plan',
        'amount',
        'status',
        'auto_renew',
        'payment_date',
        'payment_card_id',
        'transaction_number',
        'currency'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function card()
    {
        return $this->belongsTo(PaymentCard::class, 'payment_card_id');
    }
}
