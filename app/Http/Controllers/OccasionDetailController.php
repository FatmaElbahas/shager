<?php

namespace App\Http\Controllers;

use App\Models\Occasion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class OccasionDetailController extends Controller
{
    public function show($id)
    {
        $user = Auth::user();

        if (in_array($user->role, ['admin', 'admin_assistant'])) {
            // Admin/Assistant يشوف أي مناسبة
            $occasion = Occasion::find($id);
        } elseif ($user->role === 'tree_creator') {
            // Tree Creator يشوف المناسبات اللي هو أنشأها فقط
            $occasion = Occasion::where('id', $id)
                ->where('user_id', $user->id)
                ->first();
        } elseif ($user->role === 'family_member') {
            // Family Member يشوف المناسبات العامة أو مناسبات شجرته
            $occasion = Occasion::where('id', $id)
                ->where(function ($q) use ($user) {
                    $q->where('visibility', 'public')
                        ->orWhere('family_tree_id', $user->family_tree_id);
                })
                ->first();
        } else {
            // المستخدم العادي يشوف المناسبات اللي أنشأها هو فقط
            $occasion = Occasion::where('id', $id)
                ->where('user_id', $user->id)
                ->first();
        }

        if (!$occasion) {
            return response()->json(['message' => 'المناسبة غير موجودة أو غير مسموح بعرضها'], 404);
        }

        return response()->json([
            'id' => $occasion->id,
            'name' => $occasion->name,
            'latitude' => $occasion->latitude,
            'longitude' => $occasion->longitude,
            'city' => $occasion->city,
            'occasion_date' => $occasion->occasion_date,
            'visibility' => $occasion->visibility,
            'details' => $occasion->details,
            'cover_image' => $occasion->cover_image ? '/storage/' . $occasion->cover_image : null
        ]);
    }
}
