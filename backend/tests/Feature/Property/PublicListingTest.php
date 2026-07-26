<?php

namespace Tests\Feature\Property;

use App\Models\Property;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicListingTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_guest_can_browse_published_properties(): void
    {
        Property::factory()->published()->count(3)->create();
        Property::factory()->draft()->create();

        $this->getJson('/api/v1/properties')
            ->assertOk()
            ->assertJsonCount(3, 'data')
            ->assertJsonStructure(['data', 'links', 'meta']);
    }

    public function test_the_listing_filters_by_city_and_price(): void
    {
        Property::factory()->published()->forSale(100000)->create(['city' => 'Dakar']);
        Property::factory()->published()->forSale(900000)->create(['city' => 'Dakar']);
        Property::factory()->published()->forSale(100000)->create(['city' => 'Thies']);

        $this->getJson('/api/v1/properties?city=Dakar&price_max=200000')
            ->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_the_listing_rejects_invalid_filters(): void
    {
        $this->getJson('/api/v1/properties?price_min=abc&per_page=999')
            ->assertStatus(422)
            ->assertJsonValidationErrors(['price_min', 'per_page']);
    }
}
