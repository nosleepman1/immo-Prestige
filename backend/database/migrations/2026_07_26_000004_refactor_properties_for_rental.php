<?php

use App\Enums\PropertyAvailability;
use App\Enums\TransactionType;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Turns `properties` into the common trunk of a sale/rental specialisation.
 *
 * The riskiest step of the whole rental module: it moves `price` out of the
 * table and replaces the `sold` boolean by a four-state availability. Both
 * directions are written and both are transactional, so a failed deploy leaves
 * the schema and the data exactly as they were.
 *
 * Every pre-existing listing was a sale listing (the platform had no rental
 * concept), hence `transaction_type = sale` and a sale-details row for each.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->string('transaction_type')->default(TransactionType::Sale->value)->after('devise_id');
            $table->string('availability')->default(PropertyAvailability::Available->value)->after('status');
            $table->foreignId('owner_id')->nullable()->after('agency_id')->constrained('owners')->nullOnDelete();

            $table->index('transaction_type');
            $table->index('availability');
        });

        DB::transaction(function () {
            // Move the price into the sale specialisation. Rounded to the XOF
            // unit: the franc CFA has no subdivision, the decimals were noise.
            DB::table('properties')->orderBy('id')->chunkById(500, function ($rows) {
                $now = now();
                $details = [];

                foreach ($rows as $row) {
                    $details[] = [
                        'property_id' => $row->id,
                        'price' => (int) round((float) $row->price),
                        'negotiable' => false,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ];
                }

                if ($details !== []) {
                    DB::table('property_sale_details')->insert($details);
                }
            });

            DB::table('properties')->where('sold', true)
                ->update(['availability' => PropertyAvailability::Sold->value]);
            DB::table('properties')->where('sold', false)
                ->update(['availability' => PropertyAvailability::Available->value]);
        });

        Schema::table('properties', function (Blueprint $table) {
            // The index has to go before the column it covers.
            $table->dropIndex('properties_price_index');
            $table->dropColumn(['price', 'sold']);
        });
    }

    public function down(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->decimal('price', 12, 2)->default(0)->after('furnished');
            $table->boolean('sold')->default(false)->after('latitude');
            $table->index('price');
        });

        DB::transaction(function () {
            DB::table('property_sale_details')->orderBy('id')->chunkById(500, function ($rows) {
                foreach ($rows as $row) {
                    DB::table('properties')->where('id', $row->property_id)
                        ->update(['price' => $row->price]);
                }
            });

            // Only `sold` survives the round trip; reserved and rented had no
            // representation in the boolean and collapse to false, which is the
            // closest truthful answer the old column could give.
            DB::table('properties')
                ->where('availability', PropertyAvailability::Sold->value)
                ->update(['sold' => true]);
        });

        Schema::table('properties', function (Blueprint $table) {
            $table->dropIndex('properties_transaction_type_index');
            $table->dropIndex('properties_availability_index');
            $table->dropConstrainedForeignId('owner_id');
            $table->dropColumn(['transaction_type', 'availability']);
        });
    }
};
