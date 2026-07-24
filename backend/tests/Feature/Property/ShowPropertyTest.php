<?php

namespace Tests\Feature\Property;

use App\Models\Agency;
use App\Models\Property;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ShowPropertyTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_guest_can_view_a_published_property(): void
    {
        $property = Property::factory()->published()->create();

        $this->getJson("/api/v1/properties/{$property->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $property->id);
    }

    public function test_a_guest_gets_404_on_a_draft(): void
    {
        $property = Property::factory()->draft()->create();

        $this->getJson("/api/v1/properties/{$property->id}")->assertStatus(404);
    }

    public function test_the_owning_agency_can_view_its_own_draft(): void
    {
        $owner = User::factory()->agency()->create();
        $agency = Agency::factory()->create(['user_id' => $owner->id]);
        $property = Property::factory()->draft()->create(['agency_id' => $agency->id]);

        $this->actingAs($owner, 'sanctum')
            ->getJson("/api/v1/properties/{$property->id}")
            ->assertOk();
    }

    public function test_another_agency_gets_404_on_someone_elses_draft(): void
    {
        $property = Property::factory()->draft()->create();
        $intruder = User::factory()->agency()->create();

        $this->actingAs($intruder, 'sanctum')
            ->getJson("/api/v1/properties/{$property->id}")
            ->assertStatus(404);
    }

    public function test_the_public_resource_does_not_leak_agency_private_data(): void
    {
        $agency = Agency::factory()->create(['id_card' => 'SECRET-CARD-123']);
        $property = Property::factory()->published()->create(['agency_id' => $agency->id]);

        $response = $this->getJson("/api/v1/properties/{$property->id}")->assertOk();

        $response->assertJsonPath('data.agency.company_name', $agency->company_name)
            ->assertJsonPath('data.agency.is_verified', false);
        $response->assertJsonMissing(['id_card' => 'SECRET-CARD-123']);
        $this->assertArrayNotHasKey('documents', $response->json('data.agency'));
    }
}
