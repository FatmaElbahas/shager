<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('family_relations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('father_id')->nullable()->constrained('family_data_members')->onDelete('cascade');
            $table->foreignId('mother_id')->nullable()->constrained('family_data_members')->onDelete('cascade');
            $table->foreignId('child_id')->constrained('family_data_members')->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('family_relations');
    }
};
