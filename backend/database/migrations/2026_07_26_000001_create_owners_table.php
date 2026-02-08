<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * A property owner (mandant). Not a role on `users`: an owner is a record the
 * agency keeps, which *may* later be linked to an account so the owner can
 * follow their properties. `user_id` is created now, on purpose, so that adding
 * the owner portal later never requires a migration on live leases.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('owners', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agency_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('last_name');
            $table->string('first_name')->nullable();
            $table->string('phone');
            $table->string('email')->nullable();
            $table->string('address')->nullable();
            $table->string('id_document_number')->nullable();
            $table->text('notes')->nullable();
            $table->softDeletes();
            $table->timestamps();

            // An agency lists and searches its own owners; nothing is global.
            $table->index(['agency_id', 'last_name']);
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('owners');
    }
};
