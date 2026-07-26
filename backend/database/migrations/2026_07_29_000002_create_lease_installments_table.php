<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * One monthly instalment of a lease.
 *
 * RG-L16: instalments are always monthly, whatever the lease's payment
 * periodicity. A quarterly payer settles three of these at once rather than
 * owing one opaque quarterly sum — which is what makes a per-month receipt
 * possible, and arrears legible month by month.
 *
 * `paid_amount` is a running total maintained from the imputations rather than
 * recomputed on read: the agency's arrears screen reads it on every row.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lease_installments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lease_id')->constrained()->cascadeOnDelete();
            $table->string('reference', 50)->unique();
            $table->date('period_start');
            $table->date('period_end');
            $table->date('due_date');
            $table->unsignedBigInteger('rent_amount');
            $table->unsignedBigInteger('charges_amount');
            $table->unsignedBigInteger('total_amount');
            $table->unsignedBigInteger('paid_amount')->default(0);
            $table->string('status')->default('pending');
            $table->timestamp('paid_at')->nullable();
            $table->string('receipt_path')->nullable();
            $table->timestamps();

            // No duplicate month on a lease: the generator is scheduled daily
            // and must be safe to run twice.
            $table->unique(['lease_id', 'period_start']);

            // The tenant's schedule, read in order.
            $table->index(['lease_id', 'due_date']);
            // The daily late sweep, and the agency's arrears list.
            $table->index(['status', 'due_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lease_installments');
    }
};
