<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\SecureData;
use App\Models\Setting;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class SecureDataController implements HasMiddleware
{
    /**
     * تعريف الـ Middleware
     */
    public static function middleware(): array
    {
        return [
            new Middleware(\App\Http\Middleware\PlatformSecurityMiddleware::class),
        ];
    }

    /**
     * تخزين البيانات
     */
    public function store(Request $request)
    {
        $request->validate(['sensitive_data' => 'required|string']);

        $settings = Setting::first();
        $data = $request->sensitive_data;

        if ($settings && $settings->encryption_enabled) {
            $data = Crypt::encryptString($data);
        }

        $record = SecureData::create(['sensitive_data' => $data]);

        return response()->json(['message' => 'تم حفظ البيانات بنجاح', 'id' => $record->id]);
    }

    /**
     * عرض البيانات
     */
    public function show($id)
    {
        $record = SecureData::findOrFail($id);
        $settings = Setting::first();
        $data = $record->sensitive_data;

        if ($settings && $settings->encryption_enabled) {
            $data = Crypt::decryptString($data);
        }

        return response()->json(['sensitive_data' => $data]);
    }
}
