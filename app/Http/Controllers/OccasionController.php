<?php

namespace App\Http\Controllers;

use App\Models\Occasion;
use App\Models\FamilyTree;
use App\Models\FamilyDataMember;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class OccasionController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        if ($user->role === 'admin') {
            $occasions = Occasion::orderBy('occasion_date')->get();
            return response()->json($occasions);
        }

        if ($user->role === 'admin_assistant') {
            $occasions = Occasion::orderBy('occasion_date')->get();
            return response()->json($occasions);
        }

        // لو مستخدم عادي → يشوف المناسبات العامة فقط
        if ($user->role === 'user') {
            $occasions = Occasion::where('visibility', 'public')
                ->orderBy('occasion_date')
                ->get();

            return response()->json($occasions);
        }

        // لو منشئ شجرة → نجيب الشجرة بتاعته
        if ($user->role === 'tree_creator') {
            $familyTree = FamilyTree::where('user_id', $user->id)->first();

            $occasions = Occasion::where('family_tree_id', $familyTree?->id)
                ->orderBy('occasion_date')
                ->get();

            return response()->json($occasions);
        }

        // لو فرد في شجرة → نجيب شجرة العضو
        if ($user->role === 'family_member') {
            $member = FamilyDataMember::where('user_id', $user->id)->first();

            $occasions = Occasion::where(function ($query) use ($member) {
                $query->where('visibility', 'public')
                    ->orWhere('family_tree_id', $member?->family_tree_id);
            })
                ->orderBy('occasion_date')
                ->get();

            return response()->json($occasions);
        }

        // fallback → عامة فقط
        $occasions = Occasion::where('visibility', 'public')
            ->orderBy('occasion_date')
            ->get();

        return response()->json($occasions);
    }


    public function store(Request $request)
    {
        $user = Auth::user();

        // ✅ التأكد من تسجيل الدخول
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // ✅ جلب الشجرة الخاصة بالمستخدم حسب نوعه
        if ($user->role === 'tree_creator') {
            $familyTree = FamilyTree::where('user_id', $user->id)->first();
        } else {
            $member = FamilyDataMember::where('user_id', $user->id)->first();
            $familyTree = $member ? $member->familyTree : null;
        }

        if (!$familyTree) {
            return response()->json(['message' => 'لم يتم العثور على شجرة العائلة الخاصة بك'], 404);
        }

         // ✅ جلب آخر اشتراك نشط لهذا المستخدم مباشرة من جدول subscriptions
        $subscription = \App\Models\Subscription::where('user_id', $user->id)
            ->where('status', 'active')
            ->latest()
            ->first();

        if (!$subscription) {
            return response()->json(['message' => 'لا يوجد اشتراك نشط'], 403);
        }

        // ✅ جلب الخطة المرتبطة بالاشتراك
        $plan = \App\Models\Plan::find($subscription->plan_id);
        if (!$plan) {
            return response()->json(['message' => 'الخطة غير موجودة'], 404);
        }

        // ✅ منع المستخدم من إنشاء مناسبة في الخطة الأساسية
        if ($plan->plan === 'primary') {
            return response()->json([
                'message' => 'لا يمكنك إنشاء مناسبة في الخطة الأساسية. قم بالترقية إلى خطة أعلى.'
            ], 403);
        }

        // ✅ تحقق من البيانات
        $data = $request->validate([
            'name' => 'required|string',
            'occasion_date' => 'required|date',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'city' => 'nullable|string|max:255',
            'visibility' => 'required|string|in:private,public',
            'category' => 'nullable|string|in:occasion,meeting,familiar',
            'details' => 'nullable|string',
            'cover_image' => 'nullable|image|mimes:jpg,jpeg,png|max:10240'
        ]);

        // ✅ رفع الصورة إذا وُجدت
        if ($request->hasFile('cover_image')) {
            $data['cover_image'] = $request->file('cover_image')->store('occasion_covers', 'public');
        }

        // ✅ إكمال البيانات
        $data['user_id'] = $user->id;
        $data['family_tree_id'] = $familyTree->id;

        // ✅ إنشاء المناسبة
        $occasion = Occasion::create($data);

        return response()->json([
            'message' => 'تم إنشاء المناسبة بنجاح 🎉',
            'occasion' => $occasion
        ], 201);
    }


    // تعديل مناسبة
    public function update(Request $request, $id)
    {
        $occasion = Occasion::where('user_id', Auth::id())->findOrFail($id);

        $data = $request->validate([
            'name' => 'sometimes|string',
            'occasion_date' => 'sometimes|date',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'city' => 'nullable|string|max:255',
            'visibility' => 'nullable|string|in:private,public',
            'category' => 'nullable|string|in:occasion,meeting,familiar',
            'details' => 'nullable|string',
            'cover_image' => 'nullable|image|max:2048'
        ]);

        if ($request->hasFile('cover_image')) {
            $data['cover_image'] = $request->file('cover_image')->store('occasion_covers', 'public');
        }

        $occasion->update($data);

        return response()->json($occasion);
    }

    // حذف مناسبة
    public function destroy($id)
    {
        $occasion = Occasion::where('user_id', Auth::id())->findOrFail($id);
        $occasion->delete();

        return response()->json(['message' => 'Deleted successfully']);
    }


    public function viewlocation()
    {
        $locations = Occasion::select('city', 'latitude', 'longitude')
            ->get();

        return response()->json($locations);
    }
}
