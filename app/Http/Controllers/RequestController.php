<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Activity;
use App\Mail\RequestMail;
use App\Mail\UserContactEmail;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;

class RequestController extends Controller
{
    public function index(Request $request)
    {
        $query = Activity::with('user');

        // ✅ فلترة حسب شجرة منشي الشجرة
        if ($request->user() && $request->user()->role === 'tree_creator') {
            // جيب كل الأشجار اللي هو منشئها
            $treeIds = \App\Models\FamilyTree::where('user_id', $request->user()->id)
                ->pluck('id'); // ممكن يكون عنده أكتر من شجرة

            // فلترة النشاطات اللي تخص الأشجار دي
            $query->whereIn('family_tree_id', $treeIds);
        }


        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        if ($request->filled('search')) {
            $search = $request->string('search');

            $query->where(function ($q) use ($search) {
                $q->where('type', 'like', "%{$search}%")
                    ->orWhere('family_name', 'like', "%{$search}%")
                    ->orWhere('user_name', 'like', "%{$search}%")
                    ->orWhere('job', 'like', "%{$search}%")
                    ->orWhere('birth_date', 'like', "%{$search}%")
                    ->orWhere('social_status', 'like', "%{$search}%")
                    ->orWhere('user_email', 'like', "%{$search}%")
                    ->orWhere('user_phone', 'like', "%{$search}%")
                    ->orWhere('user_message', 'like', "%{$search}%");
            });
        }

        return response()->json(
            $query->orderBy('created_at', 'desc')->paginate(10)
        );
    }


    public function contact(Request $request)
    {
        $request->validate([
            'tree_id' => 'required|exists:family_trees,id',
            'user_name' => 'required|string|max:255',
            'family_name' => 'required|string|max:255',
            'user_phone' => 'required|numeric',
            'user_message' => 'required|string',
        ]);

        // جلب الشجرة
        $familyTree = \App\Models\FamilyTree::with('user')->findOrFail($request->tree_id);

        // إنشاء النشاط
        $activity = Activity::create(array_merge(
            $request->only([
                'user_name',
                'user_phone',
                'family_name',
                'user_message',
                'family_tree_id'
            ]),
            [
                'type' => 'طلب تواصل',
                'family_tree_id' => $familyTree->id,
                'user_id' => Auth::id(),
                'status' => 'pending',
            ]
        ));


        $creatorEmail = $familyTree->user->email;
        Mail::to($creatorEmail)->send(new UserContactEmail($activity));

        return response()->json(['message' => 'تم إرسال الطلب لمنشئ الشجرة بنجاح'], 201);
    }



    public function store(Request $request)
    {
        $request->validate([
            'tree_id' => 'required|exists:family_trees,id',
            'user_name' => 'required|string|max:255',
            'user_email' => 'required|email',
            'family_name' => 'required|string|max:255',
            'birth_date' => 'nullable|date',
            'social_status' => 'nullable|in:single,married',
            'job' => 'required|string|max:255',
            'user_phone' => 'required|numeric',
            'user_message' => 'required|string',
        ]);

        // جلب الشجرة
        $familyTree = \App\Models\FamilyTree::with('user')->findOrFail($request->tree_id);

        // إنشاء النشاط
        $activity = Activity::create(array_merge(
            $request->only([
                'user_name',
                'user_email',
                'user_phone',
                'family_name',
                'user_message',
                'birth_date',
                'social_status',
                'job',
                'family_tree_id'
            ]),
            [
                'type' => 'طلب انضمام',
                'family_tree_id' => $familyTree->id,
                'user_id' => Auth::id(),
                'status' => 'pending',
            ]
        ));


        $creatorEmail = $familyTree->user->email;
        Mail::to($creatorEmail)->send(new RequestMail($activity));

        return response()->json(['message' => 'تم إرسال الطلب لمنشئ الشجرة بنجاح'], 201);
    }


    public function viewtree()
    {
        $trees = \App\Models\FamilyTree::select('id', 'tree_name')->get();
        return response()->json($trees);
    }



    public function update(Request $request, Activity $activity)
    {
        $request->validate([
            'status' => 'required|in:pending,approving,rejected',
        ]);

        $activity->update(['status' => $request->status]);

        $user = $activity->user;

        if ($user) {
            if ($request->status === 'approving') {
                // ربط المستخدم بالشجرة اللي اتوافق عليها
                $user->update([
                    'role' => 'family_member',
                    'family_tree_id' => $activity->family_tree_id,
                ]);

                // إضافة أو تحديث بيانات العضو في جدول FamilyDataMember
                \App\Models\FamilyDataMember::updateOrCreate(
                    [
                        'user_id' => $user->id,
                        'family_tree_id' => $activity->family_tree_id,
                    ],
                    [
                        'name' => $user->name ?? $activity->user_name,
                        'relation' => 'member', // عدلها حسب نوع العلاقة
                        'status' => 'alive',    // عدلها حسب الحالة
                    ]
                );
            } elseif ($request->status !== 'approving') {
                // لو رجعنا الحالة لأي حاجة غير الموافقة
                if ($user->role === 'family_member' && $user->family_tree_id === $activity->family_tree_id) {
                    $user->update([
                        'role' => 'user',
                        'family_tree_id' => null,
                    ]);

                    // نحذف من جدول FamilyDataMember
                    \App\Models\FamilyDataMember::where('user_id', $user->id)
                        ->where('family_tree_id', $activity->family_tree_id)
                        ->delete();

                    $activity->update(['family_tree_id' => null]);
                }
            }
        }

        return response()->json(['message' => 'تم تحديث حالة النشاط']);
    }
}
