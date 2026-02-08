<?php

namespace Tests\Feature\Messaging;

use App\Models\Agency;
use App\Models\Property;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StartConversationTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_user_can_start_a_conversation_with_an_agency_about_a_property(): void
    {
        $client = User::factory()->create();
        $agency = Agency::factory()->create();
        $property = Property::factory()->published()->create(['agency_id' => $agency->id]);

        $this->actingAs($client, 'sanctum')
            ->postJson('/api/v1/conversations', ['agency_id' => $agency->id, 'property_id' => $property->id])
            ->assertCreated()
            ->assertJsonPath('data.client.id', $client->id)
            ->assertJsonPath('data.agency.id', $agency->id);

        $this->assertDatabaseHas('conversations', [
            'client_id' => $client->id,
            'agency_id' => $agency->id,
            'property_id' => $property->id,
        ]);
    }

    public function test_a_general_discussion_without_a_property_is_allowed(): void
    {
        $client = User::factory()->create();
        $agency = Agency::factory()->create();

        $this->actingAs($client, 'sanctum')
            ->postJson('/api/v1/conversations', ['agency_id' => $agency->id])
            ->assertCreated();

        $this->assertDatabaseHas('conversations', [
            'client_id' => $client->id,
            'agency_id' => $agency->id,
            'property_id' => null,
        ]);
    }

    public function test_starting_the_same_conversation_twice_reuses_it(): void
    {
        $client = User::factory()->create();
        $agency = Agency::factory()->create();

        $first = $this->actingAs($client, 'sanctum')
            ->postJson('/api/v1/conversations', ['agency_id' => $agency->id])
            ->json('data.id');

        $second = $this->actingAs($client, 'sanctum')
            ->postJson('/api/v1/conversations', ['agency_id' => $agency->id])
            ->json('data.id');

        $this->assertSame($first, $second);
        $this->assertDatabaseCount('conversations', 1);
    }

    public function test_an_agency_cannot_cold_start_a_conversation(): void
    {
        $agencyUser = User::factory()->agency()->create();
        Agency::factory()->create(['user_id' => $agencyUser->id]);
        $otherAgency = Agency::factory()->create();

        $this->actingAs($agencyUser, 'sanctum')
            ->postJson('/api/v1/conversations', ['agency_id' => $otherAgency->id])
            ->assertStatus(403);
    }

    public function test_a_guest_cannot_start_a_conversation(): void
    {
        $agency = Agency::factory()->create();

        $this->postJson('/api/v1/conversations', ['agency_id' => $agency->id])->assertStatus(401);
    }

    public function test_it_validates_the_property_belongs_to_the_agency(): void
    {
        $client = User::factory()->create();
        $agency = Agency::factory()->create();
        $foreignProperty = Property::factory()->published()->create(); // different agency

        $this->actingAs($client, 'sanctum')
            ->postJson('/api/v1/conversations', ['agency_id' => $agency->id, 'property_id' => $foreignProperty->id])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['property_id']);
    }

    public function test_creation_validates_the_agency_exists(): void
    {
        $client = User::factory()->create();

        $this->actingAs($client, 'sanctum')
            ->postJson('/api/v1/conversations', ['agency_id' => 999999])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['agency_id']);
    }
}
