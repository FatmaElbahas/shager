<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Coupon;

class CouponController extends Controller
{
    public function index()
    {
        return response()->json(Coupon::all());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'code' => 'required|string|unique:coupons,code',
            'client_discount_type' => 'required|in:percentage,fixed',
            'product_discount_type' => 'required|in:subscription,plan',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'usage_limit_total' => 'required|integer|min:1',
            'usage_limit_per_user' => 'required|integer|min:1',
            'discount_value' => 'required|string',
            'expiry_date' => 'required|date',
            'logo' => 'nullable|image',
        ]);

        if ($request->hasFile('logo')) {
            $data['logo'] = $request->file('logo')->store('coupons', 'public');
        }

        $coupon = Coupon::create($data);
        return response()->json(['message' => 'تم إنشاء الكوبون بنجاح', 'coupon' => $coupon]);
    }

    public function update(Request $request, $id)
    {
        $coupon = Coupon::findOrFail($id);

        $data = $request->validate([
            'client_discount_type' => 'sometimes|in:percentage,fixed',
            'product_discount_type' => 'sometimes|in:subscription,plan',
            'start_date' => 'sometimes|date',
            'end_date' => 'sometimes|date|after_or_equal:start_date',
            'usage_limit_total' => 'sometimes|integer|min:1',
            'usage_limit_per_user' => 'sometimes|integer|min:1',
            'discount_value' => 'sometimes|string',
            'expiry_date' => 'sometimes|date',
            'is_active' => 'sometimes|boolean',
            'logo' => 'nullable|image',
        ]);

        if ($request->hasFile('logo')) {
            $data['logo'] = $request->file('logo')->store('coupons', 'public');
        }

        $coupon->update($data);
        return response()->json(['message' => 'تم تحديث الكوبون بنجاح', 'coupon' => $coupon]);
    }

    public function check(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
            'amount' => 'required|numeric|min:0'
        ]);

        $code = strtoupper(trim($request->code));
        $amount = $request->input('amount', 0);

        // البحث عن الكوبون
        $coupon = Coupon::where('code', $code)
            ->where('is_active', true)
            ->where(function($query) {
                $query->where('start_date', '<=', now())
                      ->orWhereNull('start_date');
            })
            ->where(function($query) {
                $query->where('end_date', '>=', now())
                      ->orWhere(function($q) {
                          $q->where('expiry_date', '>=', now())
                            ->orWhereNull('expiry_date');
                      });
            })
            ->first();

        if (!$coupon) {
            return response()->json([
                'valid' => false, 
                'message' => 'الكوبون غير صالح أو منتهي الصلاحية'
            ], 404);
        }

        // حساب الخصم
        $discount = 0;
        $discountType = $coupon->client_discount_type;
        
        // التحقق من نوع الخصم
        if ($discountType === 'percentage' || $discountType === 'percent') {
            $discount = ($amount * floatval($coupon->discount_value)) / 100;
        } else if ($discountType === 'fixed') {
            $discount = min(floatval($coupon->discount_value), $amount);
        }

        $finalAmount = max(0, $amount - $discount);

        return response()->json([
            'valid' => true,
            'discount' => round($discount, 2),
            'discount_type' => $discountType,
            'discount_percent' => ($discountType === 'percentage' || $discountType === 'percent') ? $coupon->discount_value : null,
            'discount_amount' => ($discountType === 'fixed') ? $coupon->discount_value : null,
            'final_amount' => round($finalAmount, 2),
            'message' => 'تم تطبيق الكوبون بنجاح'
        ]);
    }
}
