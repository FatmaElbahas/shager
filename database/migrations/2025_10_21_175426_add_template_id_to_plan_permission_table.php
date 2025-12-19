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
        Schema::table('plan_permission', function (Blueprint $table) {
            $table->unsignedBigInteger('template_id');
            $table->foreign('template_id')->references('id')->on('tree_templates')->onDelete('cascade')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('plan_permission', function (Blueprint $table) {
            //
        });
    }
};
