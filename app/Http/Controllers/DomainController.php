<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Tenant;
use App\Models\DomainOrder;
use App\Models\Coupon;
use App\Services\HostingerDomainService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class DomainController extends Controller
{
    /**
     * التحقق من توفر الدومين
     */
    public function checkAvailability(Request $request)
    {
        $request->validate([
            'domain' => 'required|string|regex:/^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/'
        ]);

        $domain = $request->input('domain');

        try {
            // استخدام Hostinger API للتحقق من التوفر
            $hostingerService = new HostingerDomainService();
            $result = $hostingerService->checkDomainAvailability($domain);

            if ($result !== null) {
                // تحويل السعر من USD إلى SAR إذا لزم الأمر
                $price = $result['price'];
                if ($result['currency'] === 'USD' && $price) {
                    $price = $price * 3.75; // تحويل تقريبي
                }

                return response()->json([
                    'available' => $result['available'] ?? false,
                    'domain' => $domain,
                    'price' => $price ?? $this->getDefaultPrice($domain),
                    'currency' => 'SAR',
                    'method' => 'hostinger'
                ]);
            }

            // Fallback: استخدام WhoIs للتحقق
            return $this->checkAvailabilityViaWhois($domain);

        } catch (\Exception $e) {
            Log::error('Domain availability check failed: ' . $e->getMessage());
            // Fallback: استخدام WhoIs
            return $this->checkAvailabilityViaWhois($domain);
        }
    }

    /**
     * التحقق من التوفر باستخدام WhoIs (fallback)
     */
    private function checkAvailabilityViaWhois($domain)
    {
        // محاولة التحقق من خلال DNS lookup
        $dnsRecords = @dns_get_record($domain, DNS_ANY);
        
        // إذا وجدنا سجلات DNS، الدومين محجوز
        $available = empty($dnsRecords) || !isset($dnsRecords[0]);

        return response()->json([
            'available' => $available,
            'domain' => $domain,
            'price' => $this->getDefaultPrice($domain),
            'currency' => 'SAR',
            'method' => 'whois'
        ]);
    }

    /**
     * الحصول على سعر الدومين
     */
    public function getPrice(Request $request)
    {
        $request->validate([
            'domain' => 'required|string'
        ]);

        $domain = $request->input('domain');
        $price = $this->getDefaultPrice($domain);

        try {
            // محاولة الحصول على السعر من Hostinger
            $hostingerService = new HostingerDomainService();
            $hostingerPrice = $hostingerService->getDomainPrice($domain);

            if ($hostingerPrice !== null) {
                // تحويل من USD إلى SAR (تقريبي) إذا لزم الأمر
                $price = $hostingerPrice * 3.75;
            }
        } catch (\Exception $e) {
            Log::error('Domain price check failed: ' . $e->getMessage());
        }

        return response()->json([
            'domain' => $domain,
            'price' => round($price, 2),
            'currency' => 'SAR'
        ]);
    }

    /**
     * الحصول على السعر الافتراضي حسب الامتداد
     */
    private function getDefaultPrice($domain)
    {
        $extension = strtolower(substr($domain, strrpos($domain, '.')));
        $prices = [
            '.com' => 45,
            '.net' => 55,
            '.org' => 50,
            '.info' => 40,
            '.co' => 60,
            '.me' => 70,
            '.io' => 100,
            '.xyz' => 15,
        ];

        return $prices[$extension] ?? 50;
    }

    /**
     * حفظ طلب الدومين
     */
    public function storeOrder(Request $request)
    {
        $request->validate([
            'payment_id' => 'nullable|string',
            'status' => 'required|in:pending,completed,failed,cancelled',
            'amount' => 'required|numeric|min:0',
            'duration' => 'required|integer|min:1|max:10',
            'domains' => 'required|array|min:1',
            'domains.*.domain' => 'required|string',
            'domains.*.price' => 'required|numeric',
            'hosting' => 'nullable|array',
            'customer_info' => 'nullable|array',
            'coupon_code' => 'nullable|string',
            'discount' => 'nullable|numeric|min:0',
        ]);

        $user = Auth::user();

        $order = DomainOrder::create([
            'user_id' => $user->id,
            'payment_id' => $request->input('payment_id'),
            'status' => $request->input('status'),
            'amount' => $request->input('amount'),
            'duration' => $request->input('duration'),
            'domains' => $request->input('domains'),
            'hosting' => $request->input('hosting'),
            'customer_info' => $request->input('customer_info'),
            'coupon_code' => $request->input('coupon_code'),
            'discount' => $request->input('discount', 0),
        ]);

        // إذا كان الطلب مكتمل، حفظ الدومينات
        if ($request->input('status') === 'completed') {
            $this->registerDomains($order);
        }

        return response()->json([
            'message' => 'تم حفظ الطلب بنجاح',
            'order' => $order
        ], 201);
    }

    /**
     * تسجيل الدومينات بعد اكتمال الدفع
     */
    private function registerDomains(DomainOrder $order)
    {
        $user = Auth::user();
        
        foreach ($order->domains as $domainData) {
            $domain = $domainData['domain'];
            
            try {
                // حفظ الدومين في Tenant إذا كان موجود
                if ($user->tenant_id) {
                    $tenant = Tenant::find($user->tenant_id);
                    if ($tenant) {
                        $tenant->domains()->firstOrCreate([
                            'domain' => $domain
                        ]);
                    }
                }

                // إعداد DNS إذا كان متوفر
                $this->setupDNS($domain);
            } catch (\Exception $e) {
                Log::error("Failed to register domain {$domain}: " . $e->getMessage());
            }
        }
    }

    /**
     * إعداد DNS records
     */
    private function setupDNS($domain)
    {
        $serverIp = env('SERVER_PUBLIC_IP');

        if (!$serverIp) {
            Log::warning("SERVER_PUBLIC_IP not set, skipping DNS setup for {$domain}");
            return;
        }

        try {
            $hostingerService = new HostingerDomainService();
            $hostingerService->createARecord($domain, $serverIp);
        } catch (\Exception $e) {
            Log::error("DNS setup failed for {$domain}: " . $e->getMessage());
        }
    }

    /**
     * التحقق من صحة الكوبون
     */
    public function validateCoupon(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
            'amount' => 'required|numeric|min:0'
        ]);

        $code = strtoupper($request->input('code'));
        $amount = $request->input('amount');

        // البحث عن الكوبون في قاعدة البيانات
        $coupon = Coupon::where('code', $code)
            ->where('is_active', true)
            ->where('start_date', '<=', now())
            ->where('end_date', '>=', now())
            ->first();

        if (!$coupon) {
            return response()->json([
                'valid' => false,
                'message' => 'كود الكوبون غير صحيح أو منتهي الصلاحية'
            ], 404);
        }

        // التحقق من حد الاستخدام (يمكن إضافة used_count لاحقاً)
        // Note: used_count field may need to be added to coupons table
        // For now, we'll skip this check if the field doesn't exist

        // حساب الخصم
        $discount = 0;
        if ($coupon->client_discount_type === 'percentage') {
            $discount = ($amount * $coupon->discount_value) / 100;
        } else {
            $discount = min($coupon->discount_value, $amount);
        }

        return response()->json([
            'valid' => true,
            'discount' => round($discount, 2),
            'discount_type' => $coupon->client_discount_type,
            'final_amount' => round($amount - $discount, 2),
            'message' => 'تم تطبيق الكوبون بنجاح'
        ]);
    }

    /**
     * الحصول على طلبات المستخدم
     */
    public function getUserOrders(Request $request)
    {
        $user = Auth::user();
        
        $orders = DomainOrder::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json($orders);
    }

    /**
     * حفظ الدومين (الطريقة القديمة - للتوافق)
     */
    public function store(Request $request)
    {
        $request->validate([
            'domain' => 'required|string'
        ]);

        $user = Auth::user();

        $tenant = Tenant::find($user->tenant_id);

        if (!$tenant) {
            return response()->json(['message' => 'Tenant not found'], 404);
        }

        // حفظ الدومين داخل لارفيل Tenancy
        $tenant->domains()->create([
            'domain' => $request->domain
        ]);

        // إعداد DNS
        $this->setupDNS($request->domain);

        return response()->json([
            'message' => 'تم حفظ الدومين بنجاح',
            'domain' => $request->domain
        ]);
    }
}
