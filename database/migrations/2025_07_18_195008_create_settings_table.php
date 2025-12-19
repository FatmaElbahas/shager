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
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('platform_logo')->nullable();
            $table->string('platform_link')->nullable();
            $table->text('platform_description')->nullable();
            $table->string('default_language')->default('اللغة العربية');

            // قسم الأمان
            $table->boolean('encryption_enabled')->default(true);
            $table->boolean('security_provider_integration')->default(true);
            $table->boolean('ssl_protection')->default(true);
            $table->boolean('ddos_protection')->default(true);

            // قسم الدعم الفني
            $table->string('support_phone')->nullable();
            $table->string('support_email')->nullable();

            // حسابات التواصل الاجتماعي
            $table->string('facebook')->nullable();
            $table->string('instagram')->nullable();
            $table->string('twitter')->nullable();
            $table->string('youtube')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
