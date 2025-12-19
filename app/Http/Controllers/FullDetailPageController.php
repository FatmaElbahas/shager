<?php

namespace App\Http\Controllers;

use App\Models\Occasion;
use App\Models\News;
use Illuminate\Http\Request;

class FullDetailPageController extends Controller
{
    public function show($occasionId, $newsId)
    {
        // تفاصيل المناسبة
        $occasion = Occasion::findOrFail($occasionId);

        // تفاصيل الخبر + التعليقات + صاحب الخبر
        $news = News::with(['user', 'comments.user'])
            ->findOrFail($newsId);

        // كل الأخبار الأخرى (للعرض في العمود الجانبي)
        $latestNews = News::latest()->take(5)->get();

        return response()->json([
            'occasion' => $occasion,
            'news' => $news,
            'latest_news' => $latestNews,
        ]);

        // تأكد إن الـ occasion موجود فعلاً للخبر
        if (!$news->occasion) {
            return response()->json(['message' => 'No occasion found for this news'], 404);
        }
    }
}
