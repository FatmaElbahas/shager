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
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('profile_picture')->nullable();
            $table->string('password');
            $table->rememberToken();
            $table->enum('role', ['user', 'admin', 'tree_creator'])->default('user');
            $table->string('phone')->nullable();
            $table->string('job')->nullable();
            $table->enum('status', ['active', 'suspended', 'banned'])->default('active');
            $table->enum('membership_type', ['admin', 'member', 'invited'])->default('member');
            $table->date('birth_date')->nullable();
            $table->enum('social_status', ['single', 'married'])->nullable();
            $table->enum('life_status', ['alive', 'deceased'])->default('alive');
            $table->timestamp('email_verified_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
