<?php

namespace App\Http\Controllers;

use App\Models\Occasion;
use App\Models\TreeCreatorEvent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class TreeCreatorEventController extends Controller
{
    // عرض المناسبات حسب الشهر والسنة
    public function index(Request $request)
    {
        $month = $request->query('month', now()->month);
        $year = $request->query('year', now()->year);

        $events = TreeCreatorEvent::where('user_id', Auth::id())
            ->whereMonth('event_date', $month)
            ->whereYear('event_date', $year)
            ->orderBy('event_date')
            ->get();

        return response()->json($events);
    }


    // عرض المناسبات الفائتة
    public function pastEvents()
    {
        $events = Occasion::where('user_id', Auth::id())
            ->where('occasion_date', '<', Carbon::today('Africa/Cairo'))
            ->orderBy('occasion_date', 'desc')
            ->get();

        return response()->json($events);
    }
}
