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
        Schema::create('family_map_locations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // صاحب الموقع
            $table->string('title'); // اسم الفرد أو الموقع
            $table->string('description')->nullable(); // ملاحظات إضافية
            $table->decimal('latitude', 10, 7); // خط العرض
            $table->decimal('longitude', 10, 7); // خط الطول
            $table->string('city')->nullable(); // المدينة
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('family_map_locations');
    }
};
