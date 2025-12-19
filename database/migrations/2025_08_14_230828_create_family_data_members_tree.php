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
        Schema::create('family_data_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('family_tree_id')->constrained('family_trees')->onDelete('cascade');
            $table->string('relation');
            $table->string('name');
            $table->string('job')->nullable();
            $table->enum('status', ['alive', 'deceased'])->default('alive');
            $table->date('birth_date')->nullable();
            $table->enum('marital_status', ['single', 'married'])->nullable();
            $table->string('phone_number')->nullable();
            $table->string('profile_picture')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('family_data_members');
    }
};
