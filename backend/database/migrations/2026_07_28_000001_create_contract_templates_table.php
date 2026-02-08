<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * A lease template belonging to an agency: a name and an ordered set of
 * clauses. The platform owns the document's structure; the agency owns its
 * legal content.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contract_templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agency_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->boolean('is_default')->default(false);
            $table->softDeletes();
            $table->timestamps();

            $table->index(['agency_id', 'is_default']);
        });

        // One default template per agency, enforced in the database: two
        // defaults would make "which contract did we send?" unanswerable.
        DB::statement(<<<'SQL'
            CREATE UNIQUE INDEX contract_templates_one_default_per_agency
            ON contract_templates (agency_id)
            WHERE is_default = true AND deleted_at IS NULL
        SQL);
    }

    public function down(): void
    {
        Schema::dropIfExists('contract_templates');
    }
};
