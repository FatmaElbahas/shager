<?php

namespace App\Http\Controllers;

use App\Models\NotificationSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationSettingController extends Controller
{
    public function index()
    {
        $settings = NotificationSetting::firstOrCreate(
            ['user_id' => Auth::id()],
            [
                'new_member' => true,
                'new_news' => true,
                'password_changed' => true,
                'complaint_received' => true,
            ]
        );

        return response()->json($settings);
    }

    public function update(Request $request)
    {
        $request->validate([
            'new_member' => 'required|boolean',
            'new_news' => 'required|boolean',
            'password_changed' => 'required|boolean',
            'complaint_received' => 'required|boolean',
        ]);

        $settings = NotificationSetting::updateOrCreate(
            ['user_id' => Auth::id()],
            $request->only(['new_member', 'new_news', 'password_changed', 'complaint_received'])
        );

        return response()->json(['message' => 'تم تحديث إعدادات الإشعارات بنجاح', 'data' => $settings]);
    }
}
