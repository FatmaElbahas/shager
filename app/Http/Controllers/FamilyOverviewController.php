<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Family;
use App\Models\FamilyMember;
use App\Models\Event;
use App\Models\News;

class FamilyOverviewController extends Controller
{
    public function index($familyId, Request $request)
    {
        $family = Family::with(['members.addedByUser', 'events', 'news'])->findOrFail($familyId);

        $members = $family->members()->paginate(6);
        $membersCount = $family->members()->count();
        $invitesCount = 0; // يعتمد على نظام الدعوات لديك
        $status = 'active';
        $upcomingEvent = $family->events()->where('event_date', '>=', now())->orderBy('event_date')->first();

        return response()->json([
            'family' => $family,
            'stats' => [
                'members_count' => $membersCount,
                'invites_count' => $invitesCount,
                'status' => $status,
                'upcoming_event' => $upcomingEvent,
            ],
            'members' => $members,
            'events_this_month' => $family->events()->whereMonth('event_date', now()->month)->get(),
            'news' => $family->news,
        ]);
    }

    public function search($familyId, Request $request)
    {
        $search = $request->input('q');

        $members = FamilyMember::where('family_id', $familyId)
            ->where(function ($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                    ->orWhere('relation', 'like', "%$search%")
                    ->orWhere('email', 'like', "%$search%");
            })->get();

        $events = Event::where('family_id', $familyId)
            ->where('title', 'like', "%$search%")
            ->get();

        $news = News::where('family_id', $familyId)
            ->where('title', 'like', "%$search%")
            ->get();

        return response()->json([
            'members' => $members,
            'events' => $events,
            'news' => $news,
        ]);
    }
}
