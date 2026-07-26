<?php

namespace Tests\Feature\Rental;

use App\Models\Agency;
use App\Models\Owner;
use App\Models\Property;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OwnerCrudTest extends TestCase
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
            'last_name' => 'Diouf',
            'first_name' => 'Abdallah',
            'phone' => '770000001',
            'email' => 'proprietaire@example.test',
        ], $overrides);
    }

    public function test_an_agency_registers_an_owner(): void
    {
        [$user, $agency] = $this->agency();

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/agency/owners', $this->payload())
            ->assertCreated()
            ->assertJsonPath('data.full_name', 'Abdallah Diouf')
            ->assertJsonPath('data.has_account', false);

        $this->assertDatabaseHas('owners', [
            'agency_id' => $agency->id,
            'last_name' => 'Diouf',
        ]);
    }

    public function test_the_listing_shows_only_the_agencys_own_owners(): void
    {
        [$user, $agency] = $this->agency();
        Owner::factory()->count(2)->create(['agency_id' => $agency->id]);
        Owner::factory()->create(); // another agency's owner

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/agency/owners')
            ->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_the_listing_counts_each_owners_properties(): void
    {
        [$user, $agency] = $this->agency();
        $owner = Owner::factory()->create(['agency_id' => $agency->id]);
        Property::factory()->count(3)->forSale()
            ->create(['agency_id' => $agency->id, 'owner_id' => $owner->id]);

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/agency/owners')
            ->assertOk()
            ->assertJsonPath('data.0.properties_count', 3);
    }

    public function test_an_agency_updates_its_own_owner(): void
    {
        [$user, $agency] = $this->agency();
        $owner = Owner::factory()->create(['agency_id' => $agency->id]);

        $this->actingAs($user, 'sanctum')
            ->putJson("/api/v1/agency/owners/{$owner->id}", ['phone' => '770000009'])
            ->assertOk()
            ->assertJsonPath('data.phone', '770000009');
    }

    public function test_deleting_an_owner_keeps_the_properties_history(): void
    {
        [$user, $agency] = $this->agency();
        $owner = Owner::factory()->create(['agency_id' => $agency->id]);
        $property = Property::factory()->forSale()
            ->create(['agency_id' => $agency->id, 'owner_id' => $owner->id]);

        $this->actingAs($user, 'sanctum')
            ->deleteJson("/api/v1/agency/owners/{$owner->id}")
            ->assertNoContent();

        $this->assertSoftDeleted('owners', ['id' => $owner->id]);
        // A soft delete must not orphan the portfolio: a restored owner finds
        // its properties intact.
        $this->assertDatabaseHas('properties', ['id' => $property->id, 'owner_id' => $owner->id]);
    }

    public function test_an_agency_cannot_read_another_agencys_owner(): void
    {
        [$user] = $this->agency();
        $stranger = Owner::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->getJson("/api/v1/agency/owners/{$stranger->id}")
            ->assertStatus(403);
    }

    public function test_an_agency_cannot_edit_another_agencys_owner(): void
    {
        [$user] = $this->agency();
        $stranger = Owner::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->putJson("/api/v1/agency/owners/{$stranger->id}", ['phone' => '770000009'])
            ->assertStatus(403);

        $this->assertDatabaseMissing('owners', ['id' => $stranger->id, 'phone' => '770000009']);
    }

    public function test_a_normal_user_has_no_access_to_owners(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/agency/owners')
            ->assertStatus(403);
    }

    public function test_a_guest_has_no_access_to_owners(): void
    {
        $this->getJson('/api/v1/agency/owners')->assertStatus(401);
    }

    public function test_registration_validates_the_payload(): void
    {
        [$user] = $this->agency();

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/agency/owners', $this->payload(['last_name' => '', 'email' => 'pas-un-email']))
            ->assertStatus(422)
            ->assertJsonValidationErrors(['last_name', 'email']);
    }

    public function test_an_unknown_owner_is_a_404(): void
    {
        [$user] = $this->agency();

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/agency/owners/999999')
            ->assertStatus(404);
    }
}
