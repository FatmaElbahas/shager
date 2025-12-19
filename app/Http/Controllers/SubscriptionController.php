<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Subscription;
use App\Models\FamilyDataMember;
use App\Models\FamilyTree;
use App\Models\Plan;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class SubscriptionController extends Controller
{
    // عدد المشتركين الحاليين
    public function totalSubscribers()
    {
        $count = Subscription::where('status', 'active')->count();

        return response()->json([
            'message' => 'عدد المشتركين الحاليين',
            'total_subscribers' => $count
        ]);
    }

    // إجمالي الأرباح ونسبة التغير
    public function totalRevenue()
    {
        $currentRevenue = Subscription::where('status', 'active')
            ->whereMonth('created_at', now()->month)
            ->with('plan')
            ->get()
            ->sum(fn($sub) => $sub->plan ? $sub->plan->price : 0);

        $lastMonthRevenue = Subscription::where('status', 'active')
            ->whereMonth('created_at', now()->subMonth()->month)
            ->with('plan')
            ->get()
            ->sum(fn($sub) => $sub->plan ? $sub->plan->price : 0);

        $difference = $currentRevenue - $lastMonthRevenue;
        $percentageChange = $lastMonthRevenue > 0
            ? ($difference / $lastMonthRevenue) * 100
            : 0;

        $trend = 'stable';
        if ($percentageChange > 0) $trend = 'increase';
        elseif ($percentageChange < 0) $trend = 'decrease';

        return response()->json([
            'message' => 'إجمالي الأرباح',
            'total' => round($currentRevenue, 2),
            'percentage_change' => round($percentageChange, 2),
            'trend' => $trend,
        ]);
    }

    // دالة مساعدة للحصول على family_tree_id
    private function getFamilyTreeId($user)
    {
        if ($user->role === 'tree_creator') {
            $familyTree = FamilyTree::where('user_id', $user->id)->first();
            return $familyTree ? $familyTree->id : null;
        } else {
            $member = FamilyDataMember::where('user_id', $user->id)->first();
            return $member ? $member->family_tree_id : null;
        }
    }

    // عرض الاشتراكات مع البحث
    public function index(Request $request)
    {
        $search = $request->query('search');

        $query = Subscription::with(['user', 'familyTree', 'plan'])->latest();

        if ($search) {
            $query->whereHas('user', fn($q) => $q->where('name', 'like', "%$search%")
                ->orWhere('email', 'like', "%$search%"))
                ->orWhereHas('plan', fn($q) => $q->where('plan', 'like', "%$search%"))
                ->orWhere('status', 'like', "%$search%");
        }

        $subscriptions = $query->paginate(6);

        $subscriptions->getCollection()->transform(function ($item) {
            $item->family_tree_name = $item->familyTree?->tree_name ?? null;
            return $item;
        });

        return response()->json($subscriptions);
    }


    public function viewPayments(Request $request)
    {
        $search = $request->query('search');
        $userId = Auth::id(); // أو $request->user()->id;

        // نجيب الاشتراكات الخاصة بالمستخدم الحالي فقط
        $query = Subscription::with(['user', 'familyTree', 'plan'])
            ->where('user_id', $userId)
            ->latest();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('plan', fn($q2) => $q2->where('plan', 'like', "%$search%"))
                    ->orWhere('status', 'like', "%$search%");
            });
        }

        $subscriptions = $query->paginate(6);

        $subscriptions->getCollection()->transform(function ($item) {
            $item->family_tree_name = $item->familyTree?->tree_name ?? null;
            return $item;
        });

        return response()->json($subscriptions);
    }


    // إنشاء اشتراك جديد
    public function store(Request $request)
    {
        $data = $request->validate([
            'plan' => 'required|in:primary,advanced,custom,featured',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'auto_renew' => 'boolean',
            'status' => 'required|in:active,suspended,expired',
        ]);

        $plan = Plan::where('plan', $data['plan'])->first();
        if (!$plan) {
            return response()->json(['message' => 'الخطة غير موجودة'], 404);
        }

        $user = Auth::user();

        // نضيف user_id من المستخدم الحالي
        $data['user_id'] = $user->id;
        $data['family_tree_id'] = $this->getFamilyTreeId($user);
        $data['plan_id'] = $plan->id;

        // إنشاء الاشتراك
        $subscription = Subscription::create($data);

        // ✅ لو الخطة advanced أو custom أو featured نغير الدور
        if (in_array($data['plan'], ['advanced', 'custom', 'featured'])) {
            \App\Models\User::where('id', $user->id)->update(['role' => 'tree_creator']);
        }

        return response()->json([
            'message' => 'تم إنشاء الاشتراك بنجاح وتحديث صلاحيات المستخدم',
            'subscription' => $subscription
        ], 201);
    }


    // تحديث الاشتراك
    public function update(Request $request, Subscription $subscription)
    {
        $data = $request->validate([
            'plan' => 'required|in:primary,advanced,custom',
            'start_date' => 'date',
            'end_date' => 'date|after_or_equal:start_date',
            'auto_renew' => 'boolean',
            'status' => 'required|in:active,suspended,expired',
        ]);

        $subscription->update($data);
        return response()->json($subscription);
    }

    // حذف الاشتراك
    public function destroy(Subscription $subscription)
    {
        $subscription->delete();
        return response()->json(['message' => 'تم حذف الاشتراك بنجاح']);
    }

    // الإيرادات الشهرية
    public function monthlyRevenues()
    {
        $year = now()->year;

        $revenues = Subscription::where('status', 'active')
            ->whereYear('created_at', $year)
            ->with('plan')
            ->get()
            ->groupBy(fn($sub) => Carbon::parse($sub->created_at)->format('F'))
            ->map(fn($subs) => $subs->sum(fn($sub) => $sub->plan ? $sub->plan->price : 0));

        $months = collect([
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December'
        ]);

        $formatted = $months->mapWithKeys(fn($month) => [$month => round($revenues[$month] ?? 0, 2)]);

        return response()->json([
            'message' => 'الإيرادات الشهرية خلال العام الحالي',
            'year' => $year,
            'monthly_revenues' => $formatted,
        ]);
    }

    // إحصائيات الاشتراكات حسب الفترة
    public function getEnrollmentStats(Request $request)
    {
        $type = $request->query('type', '7days');

        switch ($type) {
            case '7days':
                $start = Carbon::now()->subDays(6);
                $format = 'Y-m-d';
                break;
            case '1month':
                $start = Carbon::now()->subDays(29);
                $format = 'Y-m-d';
                break;
            case '6months':
                $start = Carbon::now()->subMonths(5)->startOfMonth();
                $format = 'Y-m';
                break;
            case '1year':
                $start = Carbon::now()->subYear()->startOfMonth();
                $format = 'Y-m';
                break;
            default:
                return response()->json(['error' => 'نوع غير صالح'], 400);
        }

        $subscriptions = Subscription::whereDate('created_at', '>=', $start)
            ->selectRaw("DATE_FORMAT(created_at, '$format') as period, COUNT(*) as count")
            ->groupBy('period')
            ->orderBy('period')
            ->get()
            ->pluck('count', 'period');

        return response()->json(['enrollments' => $subscriptions]);
    }
}
