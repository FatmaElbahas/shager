<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Occasion;
use App\Models\FamilyTree;

class SubscriberHomeController extends Controller
{
    // عرض كل الأشجار
    public function templateshow()
    {
        $trees = FamilyTree::with('template') // تحميل بيانات القالب المرتبط
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'message' => 'تم جلب الأشجار بنجاح',
            'data' => $trees
        ], 200);
    }

    // عرض آخر 5 مناسبات خاصة بالمستخدم
    public function index()
    {
        $occasions = Occasion::where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        return response()->json($occasions);
    }
}
