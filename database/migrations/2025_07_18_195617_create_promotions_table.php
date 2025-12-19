<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('promotions', function (Blueprint $table) {
            $table->id();
            $table->string('background_image')->nullable();
            $table->string('title');
            $table->date('start_date'); // تاريخ بدء العرض
            $table->date('end_date');
            $table->boolean('is_active')->default(true);
            $table->enum('discount_type', ['percentage', 'fixed']); // نوع الخصم
            $table->string('discount_value'); // قيمة الخصم (% أو مبلغ)
            $table->text('message'); // نص رسالة العرض
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('promotions');
    }
};
