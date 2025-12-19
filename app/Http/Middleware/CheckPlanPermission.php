<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPlanPermission
{
    public function handle(Request $request, Closure $next, $permissionKey)
    {
        $user = auth()->user();

        // تحقق من تسجيل الدخول
        if (!$user) {
            return response()->json(['message' => 'Unauthorized - please login'], 401);
        }

        // تحقق من وجود خطة
        if (!$user->plan) {
            return response()->json(['message' => 'No active plan found for this user'], 403);
        }

        // جلب كل صلاحيات الخطة كـ keys فقط لتسريع التحقق
        $planPermissions = $user->plan->permissions()->pluck('key')->toArray();

        // التحقق إذا كانت الصلاحية موجودة
        if (!in_array($permissionKey, $planPermissions)) {
            return response()->json([
                'message' => "Your current plan does not allow the action: {$permissionKey}"
            ], 403);
        }

        return $next($request);
    }
}
