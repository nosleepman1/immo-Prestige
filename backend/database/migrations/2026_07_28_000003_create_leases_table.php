<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * The lease itself.
 *
 * Every amount is copied here at generation and never read from the property
 * again (RG-L09): re-pricing a listing must not silently rewrite the contracts
 * already running on it. The same goes for the notice period and the payment
 * day — the tenant signed those figures, so those figures are what binds.
 *
 * `property_id` and `tenant_user_id` restrict on delete: a lease is a legal
 * record, and cascading it away with a listing or an account would destroy the
 * proof that it existed.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('leases', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 50)->unique();
            $table->foreignId('property_id')->constrained()->restrictOnDelete();
            $table->foreignId('agency_id')->constrained()->cascadeOnDelete();
            $table->foreignId('tenant_user_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('owner_id')->nullable()->constrained('owners')->nullOnDelete();
            $table->foreignId('rental_application_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('contract_template_id')->nullable()->constrained()->nullOnDelete();

            $table->date('start_date');
            $table->date('end_date');
            $table->unsignedSmallInteger('duration_months');

            // Frozen at generation — RG-L09.
            $table->unsignedBigInteger('rent_amount');
            $table->unsignedBigInteger('charges_amount');
            $table->unsignedBigInteger('deposit_amount');
            $table->unsignedTinyInteger('advance_months');

            $table->string('periodicity')->default('monthly');
            $table->unsignedTinyInteger('payment_day')->default(5);
            $table->unsignedSmallInteger('notice_period_days')->default(30);
            $table->string('status')->default('draft');

            $table->string('generated_contract_path')->nullable();
            $table->string('signed_contract_path')->nullable();
            $table->timestamp('signed_at')->nullable();
            $table->text('signature_rejection_reason')->nullable();
            $table->foreignId('validated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('validated_at')->nullable();
            $table->date('termination_date')->nullable();
            $table->text('termination_reason')->nullable();

            $table->softDeletes();
            $table->timestamps();

            // The agency's lease list, filtered by state.
            $table->index(['agency_id', 'status']);
            // The tenant's own leases.
            $table->index(['tenant_user_id', 'status']);
            // "Which lease is running on this property?"
            $table->index(['property_id', 'status']);
            // Scheduled expiry sweep reads this.
            $table->index('end_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('leases');
    }
};
