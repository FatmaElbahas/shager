<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\FamilyTree;
use Illuminate\Support\Facades\Auth;
use App\Models\CreatorNews;
use App\Models\Occasion;


class FamilyTreeController extends Controller
{

    public function index()
    {
        $user = Auth::user();

        $trees = FamilyTree::with('template')
            ->where('user_id', $user->id)
            ->get();

        return response()->json([
            'data' => $trees
        ]);
    }

    public function getAllTrees()
    {
        // جلب كل الأشجار مع الـ template الخاص بيها
        $trees = FamilyTree::with('template')->get();

        return response()->json([
            'data' => $trees
        ]);
    }

    public function show($id)
    {
        // نجيب الشجرة مع الـ template
        $tree = FamilyTree::with('template')->findOrFail($id);

        // نجيب الأخبار الخاصة بالشجرة
        $news = CreatorNews::where('family_tree_id', $id)->get();

        // نجيب المناسبات الخاصة بالشجرة
        $occasions = Occasion::where('family_tree_id', $id)->get();

        return response()->json([
            'data' => $tree,
            'news' => $news,
            'occasions' => $occasions
        ]);
    }


    // حفظ بيانات شجرة جديدة
 public function store(Request $request)
{
    // ✅ تحقق من صحة البيانات الأساسية
    $validated = $request->validate([
        'tree_name' => 'required|string|max:255',
        'cover_image' => 'nullable|image',
        'logo_image' => 'nullable|image',
        'is_default' => 'boolean',
        'template_id' => 'nullable|integer|exists:tree_templates,id',
    ]);

    $user = Auth::user();

    // ✅ جلب آخر اشتراك نشط للمستخدم
    $subscription = \App\Models\Subscription::where('user_id', $user->id)
        ->where('status', 'active')
        ->latest()
        ->first();

    // ✅ إذا لم يرسل المستخدم template_id نختار الافتراضي
    $templateId = $validated['template_id'] ?? null;

    if (!$templateId) {
        $defaultTemplate = \App\Models\TreeTemplate::where('is_default', true)->first();
        if (!$defaultTemplate) {
            return response()->json(['message' => 'لا يوجد قالب افتراضي متاح حالياً.'], 422);
        }
        $templateId = $defaultTemplate->id;
    }

    // ✅ جلب الخطة المرتبطة بالاشتراك (إن وجدت)
    $plan = null;
    if ($subscription) {
        $plan = \App\Models\Plan::find($subscription->plan_id);
    }
 

    // ✅ التحقق من صلاحية استخدام القالب حسب نوع الخطة
    if ($plan && strtolower($plan->plan) === 'primary') {
        // فقط template 1 و 2 مسموح لهم
        if (!in_array($templateId, range(1,10))) {
            return response()->json([
                'message' => 'خطة الاشتراك (Primary)  بإمكانك فقط استخدام الفوالب المجانيه. يرجى الترقية لاستخدام باقي القوالب.'
            ], 403);
        }
    }

    // ✅ ربط القالب والمستخدم
    $validated['template_id'] = $templateId;
    $validated['user_id'] = $user->id;

    // ✅ رفع الصور إن وجدت
    if ($request->hasFile('cover_image')) {
        $validated['cover_image'] = $request->file('cover_image')->store('covers', 'public');
    }

    if ($request->hasFile('logo_image')) {
        $validated['logo_image'] = $request->file('logo_image')->store('logos', 'public');
    }

    // ✅ إنشاء الشجرة
    $tree = \App\Models\FamilyTree::create($validated);

    return response()->json([
        'message' => 'تم إنشاء الشجرة بنجاح ✅',
        'data' => $tree
    ], 201);
}





    public function update(Request $request, $id)
    {
        Log::info("Update request started for tree ID: $id");

        $tree = FamilyTree::findOrFail($id);
        Log::info("Found tree:", ['tree' => $tree->toArray()]);

        $validated = $request->validate([
            'cover_image' => 'nullable|image',
            'logo_image' => 'nullable|image',
        ]);
        Log::info("Validation passed");

        if ($request->hasFile('cover_image')) {
            Log::info('Received cover_image file');

            // حذف الصورة القديمة إن وجدت
            if ($tree->cover_image) {
                Storage::disk('public')->delete($tree->cover_image);
            }

            // تخزين الصورة الجديدة وتحديث الحقل
            $path = $request->file('cover_image')->store('covers', 'public');
            $tree->cover_image = $path;
            Log::info("Updated cover_image path: $path");
        } else {
            Log::info('No cover_image file received');
        }

        if ($request->hasFile('logo_image')) {
            Log::info('Received logo_image file');

            if ($tree->logo_image) {
                Storage::disk('public')->delete($tree->logo_image);
            }

            $path = $request->file('logo_image')->store('logos', 'public');
            $tree->logo_image = $path;
            Log::info("Updated logo_image path: $path");
        } else {
            Log::info('No logo_image file received');
        }

        $saved = $tree->save();
        Log::info('Model saved status: ' . ($saved ? 'success' : 'failure'));

        Log::info('Update request finished for tree ID: ' . $id);

        return response()->json([
            'message' => 'تم تحديث بيانات الشجرة',
            'data' => $tree,
        ]);
    }

    // حذف شجرة
    public function destroy($id)
    {
        $tree = FamilyTree::findOrFail($id);
        $tree->delete();

        return response()->json(['message' => 'تم حذف الشجرة']);
    }

    public function updateTemplateId(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'template_id' => 'required|integer|exists:tree_templates,id',
        ]);

        $tree = FamilyTree::where('user_id', $user->id)->first();

        if (!$tree) {
            return response()->json([
                'message' => 'لا توجد شجرة عائلة لهذا المستخدم. يرجى إنشاء شجرة أولاً.'
            ], 404);
        }

        $tree->template_id = $validated['template_id'];
        $tree->save();

        return response()->json([
            'message' => 'تم تحديث القالب بنجاح ✅',
            'data' => $tree->load('template')
        ]);
    }
}
