<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Subscription;

class NewUsersSubscriptionsController extends Controller
{
    public function index()
    {
        $now = now();

        $data = [
            'last_7_days' => $this->countSubscribersInPeriod($now->copy()->subDays(7)),
            'last_month' => $this->countSubscribersInPeriod($now->copy()->subMonth()),
            'last_6_months' => $this->countSubscribersInPeriod($now->copy()->subMonths(6)),
            'last_year' => $this->countSubscribersInPeriod($now->copy()->subYear()),
        ];

        return response()->json($data);
    }

    private function countSubscribersInPeriod($fromDate)
    {
        $new = Subscription::where('created_at', '>=', $fromDate)
            ->where('status', 'active')
            ->count();

        $canceled = Subscription::where('updated_at', '>=', $fromDate)
            ->where('status', 'canceled')
            ->count();

        return [
            'new' => $new,
            'canceled' => $canceled,
            'net' => $new - $canceled,
        ];
    }
}
