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
        Schema::create('tree_creator_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // صاحب المناسبة
            $table->string('event_type'); // نوع المناسبة: عيد ميلاد، زفاف...
            $table->string('person_name'); // الشخص المرتبط بالمناسبة
            $table->date('event_date'); // تاريخ المناسبة
            $table->text('details')->nullable(); // تفاصيل إضافية
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tree_creator_events');
    }
};
