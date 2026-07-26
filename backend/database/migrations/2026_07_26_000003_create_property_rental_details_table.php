<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Rental specialisation of `properties`. All amounts are XOF integer units.
 *
 * These values are the *asking* terms of the listing. Once a lease is signed the
 * agreed terms are frozen on the lease itself (Lot 12), so editing a listing
 * never rewrites an existing contract.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('property_rental_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_id')->unique()->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('rent_amount');
            $table->unsignedBigInteger('charges_amount')->default(0);
            $table->unsignedBigInteger('deposit_amount')->default(0);
            $table->unsignedTinyInteger('advance_months')->default(1);
            $table->unsignedSmallInteger('min_lease_months')->default(12);
            $table->date('available_from')->nullable();
            $table->timestamps();

            $table->index('rent_amount');
            $table->index('available_from');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('property_rental_details');
    }
};
