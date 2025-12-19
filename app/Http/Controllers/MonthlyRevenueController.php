<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Subscription;
use Carbon\Carbon;


class MonthlyRevenueController extends Controller
{
    public function monthlyRevenue()
    {
        $monthly = Subscription::where('status', 'active')
            ->whereYear('created_at', now()->year)
            ->with('plan')
            ->get()
            ->groupBy(function ($sub) {
                return Carbon::parse($sub->created_at)->format('F'); // January, February, etc.
            })
            ->map(function ($group) {
                return $group->sum(function ($sub) {
                    return $sub->plan->price;
                });
            });

        return response()->json($monthly);
    }
}
