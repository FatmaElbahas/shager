<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;

class UserProfileController extends Controller
{
    // جلب بيانات الملف الشخصي للمستخدم الحالي
    public function index(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'job' => $user->job,
            'birth_date' => $user->birth_date,
            'phone' => $user->phone,
            'social_status' => $user->social_status,
            'profile_image_url' => $user->profile_image ? '/storage/' . $user->profile_image : null,
        ]);
    }

    // تحديث بيانات الملف الشخصي
    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'job' => 'nullable|string|max:255',
            'birth_date' => 'nullable|date',
            'social_status' => 'nullable|in:single,married',
            'phone' => 'nullable|string|max:20',
            'profile_image' => 'nullable|image|mimes:jpg,jpeg,png|max:10240'
        ]);

        if ($request->hasFile('profile_image')) {
            $validated['profile_image'] = $request->file('profile_image')->store('profile_images', 'public');
        }

        $user->update($validated);

        return response()->json([
            'message' => 'تم تحديث الملف الشخصي بنجاح',
            'user' => $user
        ]);
    }
}
