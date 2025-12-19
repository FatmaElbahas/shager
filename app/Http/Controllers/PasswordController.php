<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class PasswordController extends Controller
{

    public function update(Request $request)
    {
        $request->validate([
            'new_password' => 'required|min:8|confirmed', // confirmed تتحقق من new_password_confirmation
        ]);

        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'message' => 'المستخدم غير مسجل الدخول'
            ], 401);
        }

        // تحديث الرقم الجديد
        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json([
            'message' => 'تم تغيير الرقم السري بنجاح'
        ], 200);
    }
}
