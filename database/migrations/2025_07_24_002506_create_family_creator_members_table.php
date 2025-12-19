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
        Schema::create('family_creator_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('family_tree_id')->constrained()->onDelete('cascade');
            $table->string('full_name');
            $table->string('email')->nullable();
            $table->string('status')->default('عضو'); // مثل عضو، مؤسس
            $table->date('joined_date')->nullable();
            $table->string('membership_type')->default('أفراد');
            $table->text('notes')->nullable();
            $table->string('avatar')->nullable(); // صورة رمزية
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('family_creator_members');
    }
};
