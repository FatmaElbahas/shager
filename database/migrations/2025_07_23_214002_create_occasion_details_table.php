<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('occasion_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('occasion_id')->constrained()->onDelete('cascade'); // المناسبة الرئيسية
            $table->string('title'); // عنوان المناسبة
            $table->date('date'); // تاريخ المناسبة
            $table->text('description'); // تفاصيل المناسبة
            $table->string('location_map')->nullable(); // رابط الخريطة
            $table->json('tags')->nullable(); // تصنيفات (JSON)
            $table->json('images')->nullable(); // صور مصغرة (JSON)
            $table->string('cover_image')->nullable(); // الصورة العلوية
            $table->string('added_by'); // اسم الشخص الذي أضاف المناسبة
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('occasion_details');
    }
};
