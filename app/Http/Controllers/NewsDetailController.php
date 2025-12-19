<?php

namespace App\Http\Controllers;

use App\Models\News;
use App\Models\NewsComment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NewsDetailController extends Controller
{
    // عرض التعليقات
    public function show($id)
    {
        $news = News::with(['comments.user'])->findOrFail($id);
        return response()->json($news);
    }

    // إضافة تعليق
    public function addComment(Request $request, $id)
    {
        $request->validate([
            'comment' => 'required|string',
        ]);

        $news = News::findOrFail($id);

        $comment = NewsComment::create([
            'news_id' => $news->id,
            'user_id' => Auth::id(),
            'comment' => $request->comment,
        ]);

        return response()->json($comment, 201);
    }

    // حذف تعليق
    public function deleteComment($id)
    {
        $comment = NewsComment::where('user_id', Auth::id())->findOrFail($id);
        $comment->delete();

        return response()->json(['message' => 'Comment deleted successfully']);
    }
}
