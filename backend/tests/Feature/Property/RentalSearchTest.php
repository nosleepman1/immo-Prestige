<?php

namespace Tests\Feature\Property;

use App\Enums\PropertyAvailability;
use App\Models\Property;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * `price_min` / `price_max` read the sale price on a sale search and the
 * monthly rent on a rental search — one slider on the client, two columns
 * underneath.
 */
class RentalSearchTest extends TestCase
{
    use RefreshDatabase;

    public function test_the_listing_filters_by_transaction_type(): void
    {
        Property::factory()->published()->forSale()->create();
        Property::factory()->published()->forRent()->create();
        Property::factory()->published()->forRent()->create();

        $this->getJson('/api/v1/properties?transaction_type=rent')
            ->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_a_listing_offered_both_ways_answers_either_search(): void
    {
        Property::factory()->published()->forBoth()->create();

        $this->getJson('/api/v1/properties?transaction_type=sale')->assertJsonCount(1, 'data');
        $this->getJson('/api/v1/properties?transaction_type=rent')->assertJsonCount(1, 'data');
    }

    public function test_the_price_range_reads_the_rent_on_a_rental_search(): void
    {
        Property::factory()->published()->forRent(80_000)->create();
        Property::factory()->published()->forRent(450_000)->create();
        // A sale at a price inside the rent range must not leak into it.
        Property::factory()->published()->forSale(100_000)->create();

        $this->getJson('/api/v1/properties?transaction_type=rent&price_max=100000')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.rental.rent_amount', 80_000);
    }

    public function test_without_a_transaction_filter_either_side_may_match(): void
    {
        Property::factory()->published()->forRent(80_000)->create();
        Property::factory()->published()->forSale(90_000)->create();
        Property::factory()->published()->forSale(50_000_000)->create();

        $this->getJson('/api/v1/properties?price_max=100000')
            ->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_the_listing_filters_by_availability(): void
    {
        Property::factory()->published()->forRent()->create();
        Property::factory()->published()->forRent()
            ->availability(PropertyAvailability::Rented)->create();

        $this->getJson('/api/v1/properties?availability=available')
            ->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_a_reversed_price_range_is_rejected_rather_than_returning_nothing(): void
    {
        $this->getJson('/api/v1/properties?price_min=500000&price_max=100000')
            ->assertStatus(422)
            ->assertJsonValidationErrors(['price_max']);
    }

    public function test_an_unknown_transaction_type_is_rejected(): void
    {
        $this->getJson('/api/v1/properties?transaction_type=barter')
            ->assertStatus(422)
            ->assertJsonValidationErrors(['transaction_type']);
    }
}
