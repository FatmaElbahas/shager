<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Visit;
use Carbon\Carbon;

class VisitorController extends Controller
{
    public function index()
    {
        $visitsByDay = [];
        for ($i = 29; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i)->format('Y-m-d');
            $count = Visit::whereDate('created_at', $date)->count();
            $visitsByDay[] = [
                'date' => $date,
                'count' => $count
            ];
        }

        return response()->json($visitsByDay);
    }

    public function byCountry()
    {
        $totalVisits = Visit::count();

        $visitsByCountry = Visit::select('country')
            ->selectRaw('COUNT(*) as count')
            ->groupBy('country')
            ->get();

        $countryStats = $visitsByCountry->map(function ($item) use ($totalVisits) {
            return [
                'country' => $item->country,
                'count' => $item->count,
                'percentage' => $totalVisits == 0 ? 0 : round(($item->count / $totalVisits) * 100, 2)
            ];
        });

        return response()->json($countryStats);
    }
}
