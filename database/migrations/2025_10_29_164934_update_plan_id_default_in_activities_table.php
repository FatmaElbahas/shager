<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('activities', function (Blueprint $table) {
            $table->foreignId('plan_id')
                ->nullable()
                ->default(null) // 👈 هنا القيمة الافتراضية
                ->change();
        });
    }

    public function down(): void
    {
        Schema::table('activities', function (Blueprint $table) {
            $table->foreignId('plan_id')
                ->nullable()
                ->default(null)
                ->change();
        });
    }
};
