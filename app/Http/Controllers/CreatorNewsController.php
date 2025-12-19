<?php

namespace App\Http\Controllers;

use App\Models\CreatorNews;
use App\Models\FamilyDataMember;
use App\Models\FamilyTree;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CreatorNewsController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        if (in_array($user->role, ['admin', 'admin_assistant'])) {
            // Admin/Assistant يشوفوا كل الأخبار
            $query = CreatorNews::query();
        } elseif ($user->role === 'tree_creator') {
            // Tree Creator يشوف الأخبار اللي هو نفسه أنشأها فقط
            $query = CreatorNews::where('user_id', $user->id);
        } elseif ($user->role === 'family_member') {
            // Family Member يشوف المناسبات العامة + مناسبات شجرته
            $query = CreatorNews::where(function ($q) use ($user) {
                $q->where('visibility', 'public')
                    ->orWhere('family_tree_id', $user->family_tree_id);
            });
        } else {
            // المستخدم العادي يشوف أخباره فقط
            $query = CreatorNews::where('user_id', $user->id);
        }

        // البحث
        if ($request->has('search') && $request->search !== '') {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%$search%")
                    ->orWhere('short_description', 'like', "%$search%");
            });
        }

        $news = $query->orderBy('published_at', 'desc')->paginate(6);

        return response()->json($news);
    }


    public function newsshow(Request $request)
    {
        $user = Auth::user();

        if (in_array($user->role, ['admin', 'admin_assistant'])) {
            // الأدمن والمساعد يشوفون كل الأخبار
            $query = CreatorNews::query();
        } elseif ($user->role === 'tree_creator') {
            $familyTree = FamilyTree::where('user_id', $user->id)->first();
            // منشئ الشجرة يشوف فقط الأخبار التي أنشأها هو بنفسه
            $query = CreatorNews::where('family_tree_id', $familyTree?->id);
        } elseif ($user->role === 'family_member') {
            // العضو يشوف الأخبار المرتبطة بشجرته فقط
            $member = FamilyDataMember::where('user_id', $user->id)->first();
            $familyTreeId = $member ? $member->family_tree_id : null;

            $query = CreatorNews::where('family_tree_id', $familyTreeId);
        } else {
            // المستخدمين الآخرين يشوفون فقط الأخبار الخاصة بهم
            $query = CreatorNews::where('id', null);
        }

        $news = $query->orderBy('published_at', 'desc')->paginate(6);

        return response()->json($news);
    }


    public function show($id)
    {
        $user = Auth::user();

        if (in_array($user->role, ['admin', 'admin_assistant'])) {
            // Admin/Assistant يشوف أي خبر
            $news = CreatorNews::find($id);
        } elseif ($user->role === 'tree_creator') {
            $news = CreatorNews::where('id', $id)
                ->where(function ($q) use ($user) {
                    $q->where('user_id', $user->id) // أخباره هو
                        ->orWhere('family_tree_id', $user->family_tree_id); // أو أخبار الشجرة بتاعته
                })
                ->first();
        } elseif ($user->role === 'family_member') {
            // Family Member يشوف الأخبار العامة أو أخبار شجرته
            $news = CreatorNews::where('id', $id)
                ->where(function ($q) use ($user) {
                    $q->where('visibility', 'public')
                        ->orWhere('family_tree_id', $user->family_tree_id);
                })
                ->first();
        } else {
            // المستخدم العادي يشوف أخباره فقط
            $news = CreatorNews::where('id', $id)
                ->where('user_id', $user->id)
                ->first();
        }

        if (!$news) {
            return response()->json(['message' => 'الخبر غير موجود أو غير مسموح بعرضه'], 404);
        }

        return response()->json($news);
    }


    public function store(Request $request)
    {
        // ✅ التحقق من صحة البيانات
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'short_description' => 'required|string',
            'full_description' => 'required|string',
            'published_at' => 'required|date',
            'image' => 'nullable|image|mimes:jpg,jpeg,png|max:10240'
        ]);

        $user = Auth::user();

        // ✅ جلب آخر اشتراك نشط للمستخدم
        $subscription = Subscription::where('user_id', $user->id)
            ->where('status', 'active')
            ->latest()
            ->first();

        // ✅ التحقق من نوع الخطة ومنع إنشاء الأخبار في خطة Primary
        if (!$subscription || $subscription->plan === 'primary') {
            return response()->json([
                'message' => 'خطة الاشتراك الحالية (Primary) لا تسمح بإنشاء أخبار جديدة. يرجى الترقية إلى خطة أعلى.'
            ], 403);
        }

        // ✅ رفع الصورة إن وُجدت
        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('news_images', 'public');
        }

        $data['user_id'] = $user->id;

        // ✅ تحديد family_tree_id حسب نوع المستخدم
        if ($user->role === 'tree_creator') {
            $familyTree = FamilyTree::where('user_id', $user->id)->first();
            $data['family_tree_id'] = $familyTree ? $familyTree->id : null;
        } else {
            $member = FamilyDataMember::where('user_id', $user->id)->first();
            $data['family_tree_id'] = $member ? $member->family_tree_id : null;
        }

        // ✅ إنشاء الخبر
        $news = CreatorNews::create($data);

        return response()->json([
            'message' => 'تم إنشاء الخبر بنجاح.',
            'news' => $news
        ], 201);
    }
}
