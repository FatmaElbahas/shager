<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckUserStatus
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'غير مصرح، برجاء تسجيل الدخول.'], 401);
        }

        // تحقق من حالة الحساب
        if ($user->status === 'suspended') {
            return response()->json(['message' => 'حسابك موقوف مؤقتًا. برجاء التواصل مع الدعم.'], 403);
        }

        if ($user->status === 'banned') {
            return response()->json(['message' => 'تم حظر حسابك نهائيًا بسبب مخالفة السياسات.'], 403);
        }

        // لو Active
        return $next($request);
    }
}
