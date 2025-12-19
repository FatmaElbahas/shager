<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\Subscription;
use App\Models\User;

class PaymentController extends Controller
{
    public function handleCallback(Request $request)
    {
        $paymentId = $request->query('id');
        $plan = $request->query('plan');
        $userId = $request->query('user_id');

        if (!$paymentId || !$plan || !$userId) {
            return response()->json(['message' => 'بيانات ناقصة في رابط الدفع'], 400);
        }

        // التحقق من حالة الدفع من Moyasar
        $response = Http::withBasicAuth(env('MOYASAR_SECRET_KEY'), '')
            ->get("https://api.moyasar.com/v1/payments/{$paymentId}");

        if (!$response->ok()) {
            return response()->json(['message' => 'تعذر الوصول إلى Moyasar'], 500);
        }

        $payment = $response->json();

        // تحقق من أن الدفع ناجح
        if ($payment['status'] === 'paid') {

            // تحديد مدة الاشتراك حسب الخطة
            $startDate = now();
            $endDate = now();

            if ($plan === 'advanced') {
                $endDate->addMonths(3);
            } else {
                $endDate->addYear();
            }

            // إنشاء اشتراك جديد في قاعدة البيانات
            Subscription::create([
                'user_id' => $userId,
                'plan' => $plan,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'status' => 'active',
                'auto_renew' => false,
            ]);

            // تحديث دور المستخدم (لو الخطة متقدمة)
            if (in_array($plan, ['advanced', 'custom', 'featured'])) {
                $user = User::find($userId);
                if ($user) {
                    $user->role = 'tree_creator';
                    $user->save();
                }
            }

            return redirect('http://127.0.0.1:5500/frontend/success.html'); // صفحة النجاح عندك
        }

        return redirect('http://127.0.0.1:5500/frontend/failed.html'); // صفحة فشل الدفع
    }
}
