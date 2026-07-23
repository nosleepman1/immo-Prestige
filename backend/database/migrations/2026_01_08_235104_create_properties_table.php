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
            // Reference table: never cascade-delete properties when a type is removed.
            $table->foreignId('property_type_id')->constrained()->restrictOnDelete();
            $table->foreignId('agency_id')->constrained()->onDelete('cascade');
            $table->foreignId('devise_id')->constrained()->restrictOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->double('surface');
            $table->unsignedTinyInteger('rooms');
            $table->unsignedTinyInteger('bedrooms')->nullable();
            $table->integer('floor')->nullable();
            $table->boolean('furnished')->default(false);
            $table->decimal('price', 12, 2);
            $table->string('country');
            $table->string('region');
            $table->string('city');
            $table->decimal('longitude', 9, 6)->nullable();
            $table->decimal('latitude', 9, 6)->nullable();
            $table->boolean('sold')->default(false);
            $table->boolean('is_active')->default(false);
            $table->boolean('is_posted')->default(false);
            $table->softDeletes();
            $table->timestamps();

            // Public search/filter columns.
            $table->index(['country', 'region', 'city']);
            $table->index('price');
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
