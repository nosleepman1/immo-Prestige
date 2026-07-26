<?php

namespace Tests\Feature\Property;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

/**
 * The rental refactor moves `price` out of `properties` and replaces `sold`.
 * On a platform that already holds listings, a mistake here is unrecoverable,
 * so the migration is exercised against real legacy rows in both directions.
 */
class RentalFoundationMigrationTest extends TestCase
{
    use RefreshDatabase;

    private const LOT_10_STEPS = 4;

    /**
     * Rewinds to the pre-lot-10 schema and inserts legacy rows the way the old
     * code wrote them: a decimal price, a `sold` boolean, no specialisation.
     *
     * @return array<int, int> inserted property ids, in insertion order
     */
    private function seedLegacyProperties(): array
    {
        Artisan::call('migrate:rollback', ['--step' => self::LOT_10_STEPS]);

        $this->assertTrue(Schema::hasColumn('properties', 'price'), 'rollback did not restore the legacy schema');

        $agencyUser = DB::table('users')->insertGetId([
            'name' => 'Agence Test', 'email' => 'agence@test.local',
            'password' => bcrypt('secret'), 'role' => 'agency',
            'created_at' => now(), 'updated_at' => now(),
        ]);
        $agencyId = DB::table('agencies')->insertGetId([
            'user_id' => $agencyUser, 'company_name' => 'Test SARL', 'manager_name' => 'Gerant',
            'description' => 'Agence de test', 'address' => 'Dakar', 'city' => 'Dakar',
            'phone' => '770000000', 'id_card' => 'CNI-0001', 'status' => 'accepted',
            'created_at' => now(), 'updated_at' => now(),
        ]);
        $typeId = DB::table('property_types')->insertGetId([
            'name' => 'Villa', 'created_at' => now(), 'updated_at' => now(),
        ]);
        $deviseId = DB::table('devises')->insertGetId([
            'name' => 'Franc CFA', 'code' => 'XOF', 'created_at' => now(), 'updated_at' => now(),
        ]);

        $ids = [];
        // A plain listing, a sold one, and a price carrying decimals that must
        // round rather than truncate.
        foreach ([[750000.00, false], [12500000.00, true], [99999.60, false]] as [$price, $sold]) {
            $ids[] = DB::table('properties')->insertGetId([
                'property_type_id' => $typeId, 'agency_id' => $agencyId, 'devise_id' => $deviseId,
                'name' => 'Bien '.$price, 'surface' => 120, 'rooms' => 4, 'bedrooms' => 2,
                'furnished' => false, 'price' => $price, 'country' => 'Senegal',
                'region' => 'Dakar', 'city' => 'Dakar', 'sold' => $sold, 'status' => 'published',
                'created_at' => now(), 'updated_at' => now(),
            ]);
        }

        return $ids;
    }

    public function test_the_price_moves_into_the_sale_specialisation_without_loss(): void
    {
        [$plain, $soldOne, $rounded] = $this->seedLegacyProperties();

        Artisan::call('migrate');

        $this->assertFalse(Schema::hasColumn('properties', 'price'), 'price should no longer live on properties');
        $this->assertDatabaseCount('property_sale_details', 3);

        $this->assertDatabaseHas('property_sale_details', ['property_id' => $plain, 'price' => 750000]);
        $this->assertDatabaseHas('property_sale_details', ['property_id' => $soldOne, 'price' => 12500000]);
        // 99999.60 rounds to the nearest XOF unit, it does not truncate to 99999.
        $this->assertDatabaseHas('property_sale_details', ['property_id' => $rounded, 'price' => 100000]);
    }

    public function test_the_sold_boolean_maps_onto_the_availability_states(): void
    {
        [$plain, $soldOne] = $this->seedLegacyProperties();

        Artisan::call('migrate');

        $this->assertFalse(Schema::hasColumn('properties', 'sold'));
        $this->assertDatabaseHas('properties', ['id' => $plain, 'availability' => 'available']);
        $this->assertDatabaseHas('properties', ['id' => $soldOne, 'availability' => 'sold']);
    }

    public function test_every_legacy_listing_becomes_a_sale_listing(): void
    {
        $this->seedLegacyProperties();

        Artisan::call('migrate');

        $this->assertSame(
            0,
            DB::table('properties')->where('transaction_type', '!=', 'sale')->count(),
            'legacy listings predate the rental module and can only be sale listings'
        );
        $this->assertSame(0, DB::table('properties')->whereNotNull('owner_id')->count());
    }

    public function test_the_migration_is_reversible_and_restores_the_prices(): void
    {
        [$plain, $soldOne, $rounded] = $this->seedLegacyProperties();
        Artisan::call('migrate');

        Artisan::call('migrate:rollback', ['--step' => self::LOT_10_STEPS]);

        $this->assertTrue(Schema::hasColumn('properties', 'price'));
        $this->assertTrue(Schema::hasColumn('properties', 'sold'));
        $this->assertFalse(Schema::hasTable('property_sale_details'));

        $this->assertEqualsWithDelta(750000, DB::table('properties')->find($plain)->price, 0.01);
        $this->assertEqualsWithDelta(12500000, DB::table('properties')->find($soldOne)->price, 0.01);
        $this->assertEqualsWithDelta(100000, DB::table('properties')->find($rounded)->price, 0.01);

        $this->assertEquals(1, DB::table('properties')->find($soldOne)->sold);
        $this->assertEquals(0, DB::table('properties')->find($plain)->sold);
    }
}
