<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * One article of a lease template. `body` carries {{variables}} substituted at
 * generation — see ContractVariables.
 *
 * `is_required` marks the clauses the agency considers non-negotiable; the
 * platform makes no judgement on which those are, it only refuses to drop one
 * silently.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contract_clauses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('contract_template_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('position')->default(0);
            $table->string('title');
            $table->text('body');
            $table->boolean('is_required')->default(false);
            $table->softDeletes();
            $table->timestamps();

            // Clauses are always read in order, for one template at a time.
            $table->index(['contract_template_id', 'position']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contract_clauses');
    }
};
