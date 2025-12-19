<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Setting;
use Illuminate\Support\Facades\Storage;

class SettingController extends Controller
{
    // عرض الإعدادات
    public function index()
    {
        $settings = Setting::first();

        if ($settings && $settings->platform_logo) {
            $settings->platform_logo = '/storage/' . $settings->platform_logo;
        }

        return response()->json($settings);
    }

    // تحديث الإعدادات
    public function update(Request $request)
    {
        $settings = Setting::firstOrCreate([]);

        $data = $request->validate([
            'platform_link' => 'nullable|string',
            'platform_description' => 'nullable|string',
            'default_language' => 'nullable|string',
            'encryption_enabled' => 'boolean',
            'security_provider_integration' => 'boolean',
            'ssl_protection' => 'boolean',
            'ddos_protection' => 'boolean',
            'support_phone' => 'nullable|string',
            'support_email' => 'nullable|email',
            'facebook' => 'nullable|string',
            'instagram' => 'nullable|string',
            'twitter' => 'nullable|string',
            'youtube' => 'nullable|string',
        ]);

        // لو فيه شعار جديد
        if ($request->hasFile('platform_logo')) {
            // حذف الشعار القديم لو موجود
            if ($settings->platform_logo && Storage::disk('public')->exists($settings->platform_logo)) {
                Storage::disk('public')->delete($settings->platform_logo);
            }

            // حفظ الشعار الجديد
            $data['platform_logo'] = $request->file('platform_logo')->store('logos', 'public');
        }

        $settings->update($data);

        // إعداد الرابط الكامل للصورة
        $settings->platform_logo = $settings->platform_logo ? '/storage/' . $settings->platform_logo : null;

        return response()->json([
            'message' => 'تم تحديث الإعدادات بنجاح',
            'settings' => $settings
        ]);
    }
}
