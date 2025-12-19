<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AnalyticsReport extends Model
{
    protected $fillable = [
        'total_users',
        'subscription_plans',
        'total_profit',
        'growth_percentage',
        'active_subscribers_chart',
        'monthly_revenue_chart',
        'website_visitors_chart',
        'revenue_by_customer_type',
        'visitors_by_country',
        'geo_map_data',
    ];

    protected $casts = [
        'active_subscribers_chart' => 'array',
        'monthly_revenue_chart' => 'array',
        'website_visitors_chart' => 'array',
        'revenue_by_customer_type' => 'array',
        'visitors_by_country' => 'array',
        'geo_map_data' => 'array',
    ];
}
