<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class SubscribersController extends Controller
{

    public function countSubscribers()
    {
        $count = \App\Models\Subscription::where('status', 'active')
            ->distinct('user_id')
            ->count('user_id');


        return response()->json([
            'message' => 'عدد المشتركين الفعّالين',
            'count' => $count
        ]);
    }
}
