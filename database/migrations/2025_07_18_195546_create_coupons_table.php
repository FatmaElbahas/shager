<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('coupons', function (Blueprint $table) {
            $table->id();
            $table->string('logo')->nullable();
            $table->string('discount_value'); // مثال: %25
            $table->date('expiry_date');
            $table->boolean('is_active')->default(true);
            $table->string('code')->unique(); // كود الكوبون
            $table->enum('client_discount_type', ['percentage', 'fixed']); // نوع الخصم للعميل
            $table->enum('product_discount_type', ['subscription', 'plan']); // نوع الخصم للمنتج
            $table->date('start_date'); // تاريخ بداية الكوبون
            $table->date('end_date'); // تاريخ انتهاء الكوبون
            $table->integer('usage_limit_total'); // عدد مرات الاستخدام للجميع
            $table->integer('usage_limit_per_user'); // عدد مرات الاستخدام للعميل الواحد
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('coupons');
    }
};
