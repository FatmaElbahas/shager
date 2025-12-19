<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('analytics_reports', function (Blueprint $table) {
            $table->id();
            $table->integer('total_users')->default(0);
            $table->integer('subscription_plans')->default(0);
            $table->decimal('total_profit', 10, 2)->default(0);
            $table->decimal('growth_percentage', 5, 2)->default(0);
            $table->json('active_subscribers_chart');   // بيانات المخطط الخطي
            $table->json('monthly_revenue_chart');      // بيانات المخطط العمودي
            $table->json('website_visitors_chart');     // بيانات المخطط الدائري
            $table->json('revenue_by_customer_type');   // بيانات المخطط المكدس
            $table->json('visitors_by_country');        // بيانات التوزيع حسب الدولة
            $table->json('geo_map_data');               // بيانات الخريطة الجغرافية
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('analytics_reports');
    }
};
