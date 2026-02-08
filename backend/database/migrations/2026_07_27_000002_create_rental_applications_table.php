<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * A candidate's application for a rental property.
 *
 * `agency_id` is denormalised from the property on purpose: the agency's work
 * queue filters on (agency, status) constantly, and reaching it through
 * `properties` on every listing would cost a join for a value that can never
 * change — a property does not move between agencies.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rental_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_id')->constrained()->cascadeOnDelete();
            $table->foreignId('agency_id')->constrained()->cascadeOnDelete();
            $table->foreignId('applicant_user_id')->constrained('users')->cascadeOnDelete();
            $table->string('status')->default('submitted');
            $table->date('desired_start_date');
            $table->unsignedSmallInteger('desired_duration_months');
            $table->text('message')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->text('requested_documents')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->softDeletes();
            $table->timestamps();

            // The agency's work queue: "my pending applications", most common read.
            $table->index(['agency_id', 'status']);
            // The candidate's own list.
            $table->index(['applicant_user_id', 'status']);
            $table->index(['property_id', 'status']);
        });

        // RG-L05 enforced in the database, not merely in a validation rule:
        // one live application per (property, candidate), while still allowing
        // a fresh application after a refusal or a cancellation. A check in PHP
        // alone loses this race under a double submit.
        DB::statement(<<<'SQL'
            CREATE UNIQUE INDEX rental_applications_one_active_per_candidate
            ON rental_applications (property_id, applicant_user_id)
            WHERE status IN ('submitted', 'under_review', 'documents_requested', 'accepted')
              AND deleted_at IS NULL
        SQL);
    }

    public function down(): void
    {
        Schema::dropIfExists('rental_applications');
    }
};
