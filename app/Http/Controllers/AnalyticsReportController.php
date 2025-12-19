<?php

namespace App\Http\Controllers;

use App\Models\AnalyticsReport;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;

class AnalyticsReportController extends Controller
{
    // جلب التقرير الحالي
    public function index()
    {
        return response()->json(AnalyticsReport::latest()->first());
    }

    // إضافة تقرير جديد
    public function store(Request $request)
    {
        $data = $request->validate([
            'total_users' => 'required|integer',
            'subscription_plans' => 'required|integer',
            'total_profit' => 'required|numeric',
            'growth_percentage' => 'required|numeric',
            'active_subscribers_chart' => 'required|array',
            'monthly_revenue_chart' => 'required|array',
            'website_visitors_chart' => 'required|array',
            'revenue_by_customer_type' => 'required|array',
            'visitors_by_country' => 'required|array',
            'geo_map_data' => 'required|array',
        ]);

        $report = AnalyticsReport::create($data);
        return response()->json(['message' => 'تم إضافة التقرير بنجاح', 'report' => $report]);
    }

    // تصدير البيانات إلى ملف (Excel/PDF)
    public function export()
    {
        $report = AnalyticsReport::latest()->first();
        return response()->json(['message' => 'سيتم تصدير التقرير', 'report' => $report]);
    }
}
