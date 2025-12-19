<?php

namespace App\Http\Controllers;

use App\Models\Invitation;
use App\Models\Family;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class InvitationController extends Controller
{
    public function index(Request $request)
    {
        $query = Invitation::with('user'); // صححت هنا

        if ($request->has('name') && $request->name != '') {
            $query->whereHas('user', function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->name . '%');
            });
        }

        $invitations = $query->paginate(6);

        return response()->json($invitations);
    }



    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'sending_date' => 'required|date',
            'permission' => 'required|in:view_edit',
            'usage_limit' => 'required|integer|min:1',
            'status' => 'required|in:active,pending,expired',
        ]);

        $maxInvites = 100;
        $sentCount = Invitation::where('user_id', $request->user_id)
            ->whereDate('sending_date', now()->toDateString())
            ->count();

        if ($sentCount >= $maxInvites) {
            return response()->json(['message' => 'تم تجاوز الحد الأقصى لعدد الدعوات اليومية.'], 429);
        }

        $invitation = Invitation::create([
            'user_id' => $request->user_id,
            'sending_date' => now(),
            'invite_code' => Str::random(8),
            'permission' => $request->permission,
            'usage_limit' => $request->usage_limit,
            'status' => 'active',
        ]);

        // تحديث الدور تلقائيًا لو الصلاحية view_edit
        if ($request->permission === 'view_edit') {
            $user = User::find($request->user_id);
            if ($user) {
                $user->role = 'admin_assistant';
                $user->save();
            }
        }

        return response()->json([
            'message' => 'Invitation created successfully.',
            'data' => $invitation,
        ]);
    }

    public function accept(Request $request)
    {
        $request->validate([
            'invite_code' => 'required|string',
            'name' => 'sometimes|string',
            'email' => 'sometimes|email',
            'password' => 'sometimes|string|min:6',
        ]);

        // جلب الدعوة النشطة أو اللي لسه ما تجاوزتش الحد المسموح
        $invitation = Invitation::where('invite_code', $request->invite_code)
            ->where('status', 'active')
            ->firstOrFail();

        // تحقق من الحد الأقصى للاستخدام
        if ($invitation->usage_count >= $invitation->usage_limit) {
            return response()->json(['message' => 'تم تجاوز الحد الأقصى لاستخدام هذه الدعوة.'], 403);
        }

        // جلب المستخدم المرتبط بالدعوة أو إنشاء مستخدم جديد
        $user = $invitation->user;
        if (!$user) {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => bcrypt($request->password),
                'role' => 'user', // مؤقت، سيتم تغييره حسب الدعوة
            ]);
            $invitation->user_id = $user->id;
        }

        // تحديث الدور حسب صلاحية الدعوة
        if ($invitation->permission === 'view_edit' && $user->role !== 'admin_assistant') {
            $user->role = 'admin_assistant';
            $user->save();
        }

        // زيادة عدد الاستخدام
        $invitation->usage_count += 1;

        // لو وصلنا الحد المسموح، نغيّر حالة الدعوة
        if ($invitation->usage_count >= $invitation->usage_limit) {
            $invitation->status = 'expired';
        }

        $invitation->save();

        // توليد توكن API للمستخدم
        $token = $user->createToken('admin_assistant_token')->plainTextToken;

        return response()->json([
            'message' => 'Invitation accepted successfully.',
            'user' => $user,
            'token' => $token,
        ]);
    }


    public function destroy($id)
    {
        $invitation = Invitation::findOrFail($id);
        $invitation->delete();

        return response()->json(['message' => 'Invitation deleted successfully.']);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:active,pending,expired',
        ]);

        $invitation = Invitation::findOrFail($id);
        $invitation->update(['status' => $request->status]);

        // لو الحالة اتغيرت لـ expired، ارجع الدور للـ user
        if ($request->status === 'expired' && $invitation->user) {
            $invitation->user->role = 'user';
            $invitation->user->save();
        }

        return response()->json(['message' => 'Invitation status updated.']);
    }


    public function stats()
    {
        $total = Invitation::count();
        $active = Invitation::where('status', 'active')->count();
        $pending = Invitation::where('status', 'pending')->count();
        $expired = Invitation::where('status', 'expired')->count();

        $topUsers = User::withCount(['invitations'])
            ->orderByDesc('invitations_count')
            ->limit(5)->get();

        return response()->json([
            'total' => $total,
            'active' => $active,
            'pending' => $pending,
            'expired' => $expired,
            'acceptance_rate' => $total > 0 ? round(($active / $total) * 100, 2) : 0,
            'top_senders' => $topUsers,
        ]);
    }
}
