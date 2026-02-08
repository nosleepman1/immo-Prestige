<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * The imputation: which payment settled which instalment, and for how much.
 *
 * This is the piece that makes "pay three months at once" possible. Payment and
 * instalment are many-to-many in both directions — one payment can cover three
 * months, and one month can be settled by two partial payments — and neither is
 * expressible without a carrying association. `applied_amount` is what makes it
 * a carrying one: knowing *that* a payment touched a month is useless without
 * knowing how much of it went there.
 *
 * It is also the source of truth behind `lease_installments.paid_amount` and
 * its status.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('installment_payment', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('lease_installment_id')->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('applied_amount');
            $table->timestamps();

            // One line per (payment, instalment): a second imputation of the
            // same payment onto the same month would double-count it.
            $table->unique(['payment_id', 'lease_installment_id']);
            $table->index('lease_installment_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('installment_payment');
    }
};
