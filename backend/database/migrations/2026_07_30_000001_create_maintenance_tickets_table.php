<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * An incident reported on a rented property.
 *
 * `property_id` is denormalised from the lease: the agency's maintenance queue
 * groups by building, and a lease never changes property. Same reasoning as
 * `agency_id` on rental applications.
 *
 * Tickets keep their own discussion thread, separate from the commercial
 * conversation, so a leak does not get buried under a negotiation.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('maintenance_tickets', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 50)->unique();
            $table->foreignId('lease_id')->constrained()->cascadeOnDelete();
            $table->foreignId('property_id')->constrained()->cascadeOnDelete();
            $table->foreignId('reported_by_user_id')->constrained('users')->cascadeOnDelete();
            $table->string('category');
            $table->string('priority')->default('normal');
            $table->string('title');
            $table->text('description');
            $table->string('status')->default('open');
            $table->timestamp('resolved_at')->nullable();
            $table->text('resolution_note')->nullable();
            $table->softDeletes();
            $table->timestamps();

            // The tenant's own list, and the agency's queue by lease.
            $table->index(['lease_id', 'status']);
            // "What is still open on this building?"
            $table->index(['property_id', 'status']);
            // The agency sorts its queue by urgency then age.
            $table->index(['status', 'priority']);
        });

        Schema::create('maintenance_ticket_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('maintenance_ticket_id')->constrained()->cascadeOnDelete();
            $table->string('image_path');
            $table->unsignedInteger('position')->default(0);
            $table->softDeletes();
            $table->timestamps();

            $table->index(['maintenance_ticket_id', 'position']);
        });

        Schema::create('maintenance_ticket_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('maintenance_ticket_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->text('body');
            $table->softDeletes();
            $table->timestamps();

            $table->index(['maintenance_ticket_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('maintenance_ticket_messages');
        Schema::dropIfExists('maintenance_ticket_images');
        Schema::dropIfExists('maintenance_tickets');
    }
};
