<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Mail\ActivityMail;
use App\Models\Subscription;
use App\Models\Plan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;

class ActivityController extends Controller
{
    public function index(Request $request)
    {
        $query = Activity::with('user');

        // عرض للـ admin فقط الأنشطة من نوع "إضافة شجرة"
        if (auth()->user()->role === 'admin') { // تأكدي من اسم حقل الدور عندك
            $query->where('type', 'إضافة شجرة');
        }

        // فلترة بالحالة (إن وُجدت)
        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        // فلترة بالبحث الحر (إن وُجد)
        if ($request->filled('search')) {
            $search = $request->string('search');

            $query->where(function ($q) use ($search) {
                $q->where('type', 'like', "%{$search}%")
                    ->orWhere('family_name', 'like', "%{$search}%")
                    ->orWhere('user_name', 'like', "%{$search}%")
                    ->orWhere('user_email', 'like', "%{$search}%")
                    ->orWhere('user_phone', 'like', "%{$search}%")
                    ->orWhere('user_message', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($uq) use ($search) {
                        $uq->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        // إرجاع البيانات بشكل paginate
        return response()->json(
            $query->orderBy('created_at', 'desc')->paginate(10)
        );
    }



    public function store(Request $request)
    {
        $request->validate([
            'user_name' => 'required|string|max:255',
            'user_email' => 'required|email',
            'user_phone' => 'required|string|regex:/^([0-9\s\-\+\(\)]*)$/|min:10',
            'family_name' => 'required|string|max:255',
            'user_message' => 'required|string',
            'plan' => 'required|string|in:primary',
        ]);

        // 🔹 البحث عن الخطة في جدول plans حسب الاسم
        $plan = \App\Models\Plan::where('plan', $request->plan)->first();

        if (!$plan) {
            return response()->json(['error' => 'الخطة المحددة غير موجودة في النظام'], 422);
        }

        // 🔹 إنشاء activity وربطها بـ plan_id الصحيح
        $activity = Activity::create([
            'user_name' => $request->user_name,
            'user_email' => $request->user_email,
            'user_phone' => $request->user_phone,
            'family_name' => $request->family_name,
            'user_message' => $request->user_message,
            'type' => 'إضافة شجرة',
            'plan_id' => $plan->id, //
            'family_tree_id' => null,
            'user_id' => Auth::id(),
            'status' => 'pending',
        ]);

        // 🔹 إرسال الإيميل للإدارة
        Mail::to('shagertk@gmail.com')->send(new ActivityMail($activity));

        return response()->json(['message' => 'تم إرسال الطلب للشركة بنجاح'], 201);
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
            // ✅ ترقيته إلى tree_creator
            $user->update(['role' => 'tree_creator']);

            // ✅ إنشاء اشتراك جديد بخطة primary (id = 1)
            Subscription::create([
                'user_id' => $user->id,
                'plan_id' => 1, // خطة الـ primary
                'start_date' => now(),
                'end_date' => now()->addMonth(), // مدة الاشتراك مثلاً شهر
                'status' => 'active',
            ]);
        } else {
            // ✅ لو رجعنا الحالة لأي حالة غير approving
            if ($user->role === 'tree_creator') {
                $user->update(['role' => 'user']);
                $activity->update(['family_tree_id' => null]);
            }
        }
    }

    return response()->json(['message' => 'تم تحديث حالة النشاط بنجاح ✅']);
}



    // public function upgradeRoleIfEligible()
    // {
    //     $user = Auth::user();

    //     // ✅ التحقق من وجود اشتراك نشط
    //     $subscription = \App\Models\Subscription::where('user_id', $user->id)
    //         ->where('status', 'active')
    //         ->latest()
    //         ->first();

    //     if (!$subscription) {
    //         return response()->json([
    //             'message' => 'لا يوجد اشتراك نشط لهذا المستخدم.'
    //         ], 404);
    //     }

    //     // ✅ الخطط المسموح لها بأن تكون Tree Creator
    //     $allowedPlans = ['advanced', 'featured', 'custom'];

    //     if (in_array(strtolower($subscription->plan), $allowedPlans)) {
    //         // ✅ تحديث الدور إلى Tree Creator
    //         $user->update(['role' => 'tree_creator']);

    //         return response()->json([
    //             'message' => 'تم ترقية المستخدم إلى Tree Creator بنجاح.',
    //             'user' => $user
    //         ], 200);
    //     }

    //     // ❌ في حال كانت الخطة لا تؤهل للترقية
    //     return response()->json([
    //         'message' => 'خطة المستخدم الحالية لا تؤهله ليكون منشئ شجرة.'
    //     ], 403);
    // }
}
