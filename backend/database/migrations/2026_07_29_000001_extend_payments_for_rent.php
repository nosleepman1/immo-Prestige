<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Opens `payments` to rent.
 *
 * Two things change direction here. Until now every payment flowed from an
 * agency to the platform; a rent payment flows from a tenant to an agency, so
 * `payer_user_id` names who paid while `agency_id` keeps naming the agency
 * concerned — never the payer. And money can now arrive in cash, which has
 * neither provider nor invoice token, so `provider` becomes nullable.
 *
 * `purpose` and `status` were enum columns. SQLite cannot widen an enum in
 * place, so both become plain strings backed by the PHP enums, as everywhere
 * else in this schema since lot 10. That swap happens first: an index created
 * over `status` beforehand would break the moment the old column is dropped.
 */
return new class extends Migration
{
    public function up(): void
    {
        // 1. Widen the two enums, preserving every existing value verbatim.
        Schema::table('payments', function (Blueprint $table) {
            $table->string('purpose_new')->nullable()->after('purpose');
            $table->string('status_new')->nullable()->after('status');
        });

        DB::table('payments')->update([
            'purpose_new' => DB::raw('purpose'),
            'status_new' => DB::raw('status'),
        ]);

        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn(['purpose', 'status']);
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->renameColumn('purpose_new', 'purpose');
            $table->renameColumn('status_new', 'status');
        });

        // 2. The rent columns.
        Schema::table('payments', function (Blueprint $table) {
            $table->foreignId('lease_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('payer_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('method')->default('paydunya');
            $table->foreignId('validated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('validated_at')->nullable();
            $table->string('provider')->nullable()->default('paydunya')->change();
        });

        // 3. Indexes last, once every column they cover exists for good.
        Schema::table('payments', function (Blueprint $table) {
            // "What has this lease been paid?"
            $table->index(['lease_id', 'status']);
            // The agency's cash register.
            $table->index(['agency_id', 'method']);
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropIndex(['lease_id', 'status']);
            $table->dropIndex(['agency_id', 'method']);
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->dropConstrainedForeignId('lease_id');
            $table->dropConstrainedForeignId('payer_user_id');
            $table->dropConstrainedForeignId('validated_by');
            $table->dropColumn(['method', 'validated_at']);
        });

        // `purpose` and `status` stay strings: narrowing them back would refuse
        // the rent rows this migration made possible, and deleting those rows
        // to satisfy a rollback would destroy payment history.
    }
};
