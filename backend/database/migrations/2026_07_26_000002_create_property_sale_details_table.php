<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Sale specialisation of `properties`. One row at most per property, enforced by
 * a unique constraint rather than by application code.
 *
 * `price` is an unsigned integer in XOF units, like every other amount in the
 * schema (plans.price, payments.amount): the franc CFA has no subdivision in
 * practice, and mixing decimal and integer money invites rounding bugs.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('property_sale_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_id')->unique()->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('price');
            $table->boolean('negotiable')->default(false);
            $table->timestamps();

            // Public search filters on a price range within sale listings.
            $table->index('price');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('property_sale_details');
    }
};
