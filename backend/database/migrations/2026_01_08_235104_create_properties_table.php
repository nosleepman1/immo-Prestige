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
        Schema::create('properties', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_type_id')->constrained()->onDelete('cascade');
            $table->foreignId('agency_id')->constrained()->onDelete('cascade');
            $table->foreignId('devise_id')->constrained();
            $table->string('name');
            $table->text('description')->nullable();
            $table->double('surface');
            $table->double('rooms');
            $table->double('bedrooms')->nullable();
            $table->integer('floor')->nullable();
            $table->boolean('furnished')->default(false);
            $table->decimal('price', 10, 2);
            $table->string('country');
            $table->string('region');
            $table->string('city');
            $table->string('longitude')->nullable();
            $table->string('latitude')->nullable();
            $table->boolean('sold')->default(false);
            $table->boolean('is_active')->default(false);
            $table->boolean('is_posted')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('properties');
    }
};
