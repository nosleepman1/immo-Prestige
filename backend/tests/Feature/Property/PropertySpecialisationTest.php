<?php

namespace Tests\Feature\Property;

use App\Actions\Property\PublishProperty;
use App\Exceptions\IncompletePropertyListingException;
use App\Models\Agency;
use App\Models\Devise;
use App\Models\Owner;
use App\Models\Property;
use App\Models\PropertyImage;
use App\Models\PropertyType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * A listing must carry exactly the details its transaction type implies:
 * a price for a sale, a rent for a rental, both when it is offered both ways.
 */
class PropertySpecialisationTest extends TestCase
{
    use RefreshDatabase;

    /** @return array{0: User, 1: Agency} */
    private function agency(): array
    {
        $user = User::factory()->agency()->create();

        return [$user, Agency::factory()->create(['user_id' => $user->id])];
    }

    /** @param array<string, mixed> $overrides */
    private function payload(array $overrides = []): array
    {
        return array_merge([
            'property_type_id' => PropertyType::factory()->create()->id,
            'devise_id' => Devise::factory()->create()->id,
            'name' => 'Appartement Mermoz',
            'surface' => 90,
            'rooms' => 4,
            'country' => 'Sénégal',
            'region' => 'Dakar',
            'city' => 'Dakar',
        ], $overrides);
    }

    public function test_a_rental_listing_stores_its_terms(): void
    {
        [$user] = $this->agency();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/properties', $this->payload([
                'transaction_type' => 'rent',
                'rental' => [
                    'rent_amount' => 150_000,
                    'charges_amount' => 10_000,
                    'deposit_amount' => 300_000,
                    'advance_months' => 2,
                ],
            ]))
            ->assertCreated()
            ->assertJsonPath('data.rental.rent_amount', 150_000)
            // Derived server-side so the three clients cannot drift apart.
            ->assertJsonPath('data.rental.monthly_total', 160_000)
            ->assertJsonPath('data.rental.move_in_cost', 620_000);

        $this->assertDatabaseHas('property_rental_details', [
            'property_id' => $response->json('data.id'),
            'rent_amount' => 150_000,
        ]);
        $this->assertDatabaseCount('property_sale_details', 0);
    }

    public function test_a_sale_listing_cannot_carry_a_rent(): void
    {
        [$user] = $this->agency();

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/properties', $this->payload([
                'transaction_type' => 'sale',
                'sale' => ['price' => 25_000_000],
                'rental' => ['rent_amount' => 150_000],
            ]))
            ->assertStatus(422)
            ->assertJsonValidationErrors(['rental']);
    }

    public function test_a_rental_listing_must_carry_a_rent(): void
    {
        [$user] = $this->agency();

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/properties', $this->payload(['transaction_type' => 'rent']))
            ->assertStatus(422)
            ->assertJsonValidationErrors(['rental']);
    }

    public function test_a_listing_offered_both_ways_carries_both_sides(): void
    {
        [$user] = $this->agency();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/properties', $this->payload([
                'transaction_type' => 'both',
                'sale' => ['price' => 25_000_000],
                'rental' => ['rent_amount' => 150_000],
            ]))
            ->assertCreated();

        $id = $response->json('data.id');
        $this->assertDatabaseHas('property_sale_details', ['property_id' => $id]);
        $this->assertDatabaseHas('property_rental_details', ['property_id' => $id]);
    }

    public function test_switching_a_listing_to_rental_drops_the_sale_price(): void
    {
        [$user, $agency] = $this->agency();
        $property = Property::factory()->forSale(25_000_000)->create(['agency_id' => $agency->id]);

        $this->actingAs($user, 'sanctum')
            ->putJson("/api/v1/properties/{$property->id}", [
                'transaction_type' => 'rent',
                'rental' => ['rent_amount' => 150_000],
            ])
            ->assertOk();

        // The unreachable price is removed, not left behind to resurface on the
        // next switch back to sale.
        $this->assertDatabaseMissing('property_sale_details', ['property_id' => $property->id]);
        $this->assertDatabaseHas('property_rental_details', ['property_id' => $property->id]);
    }

    public function test_switching_to_rental_without_supplying_a_rent_is_refused(): void
    {
        [$user, $agency] = $this->agency();
        $property = Property::factory()->forSale()->create(['agency_id' => $agency->id]);

        $this->actingAs($user, 'sanctum')
            ->putJson("/api/v1/properties/{$property->id}", ['transaction_type' => 'rent'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['rental']);

        // Nothing was touched: the listing is still a sale with its price.
        $this->assertDatabaseHas('property_sale_details', ['property_id' => $property->id]);
    }

    public function test_an_agency_cannot_attach_another_agencys_owner(): void
    {
        [$user] = $this->agency();
        $stranger = Owner::factory()->create(); // belongs to a different agency

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/properties', $this->payload([
                'transaction_type' => 'sale',
                'sale' => ['price' => 25_000_000],
                'owner_id' => $stranger->id,
            ]))
            ->assertStatus(422)
            ->assertJsonValidationErrors(['owner_id']);
    }

    public function test_the_owner_is_never_exposed_on_a_public_listing(): void
    {
        [, $agency] = $this->agency();
        $owner = Owner::factory()->create(['agency_id' => $agency->id]);
        $property = Property::factory()->published()->forSale()
            ->create(['agency_id' => $agency->id, 'owner_id' => $owner->id]);

        $this->getJson("/api/v1/properties/{$property->id}")
            ->assertOk()
            ->assertJsonMissingPath('data.owner');
    }

    public function test_the_agency_sees_the_owner_on_its_own_listing(): void
    {
        [$user, $agency] = $this->agency();
        $owner = Owner::factory()->create(['agency_id' => $agency->id]);
        $property = Property::factory()->published()->forSale()
            ->create(['agency_id' => $agency->id, 'owner_id' => $owner->id]);

        $this->actingAs($user, 'sanctum')
            ->getJson("/api/v1/properties/{$property->id}")
            ->assertOk()
            ->assertJsonPath('data.owner.id', $owner->id);
    }

    public function test_publication_refuses_a_listing_whose_specialisation_is_missing(): void
    {
        [, $agency] = $this->agency();

        // Built straight through the factory, bypassing the request validation
        // that normally guarantees the invariant — this is the last gate.
        $property = Property::factory()->draft()->create([
            'agency_id' => $agency->id,
            'description' => 'Une belle villa avec piscine.',
        ]);
        PropertyImage::factory()->create(['property_id' => $property->id]);

        $this->expectException(IncompletePropertyListingException::class);
        $this->expectExceptionMessage('un prix de vente est requis');

        app(PublishProperty::class)->handle($property, $agency);
    }
}
