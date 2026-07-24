<?php

namespace Tests\Feature\Property;

use App\Models\Agency;
use App\Models\Devise;
use App\Models\PropertyType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CreatePropertyTest extends TestCase
{
    use RefreshDatabase;

    private function payload(array $overrides = []): array
    {
        return array_merge([
            'property_type_id' => PropertyType::factory()->create()->id,
            'devise_id' => Devise::factory()->create()->id,
            'name' => 'Villa Almadies',
            'surface' => 250,
            'rooms' => 6,
            'price' => 750000,
            'country' => 'Sénégal',
            'region' => 'Dakar',
            'city' => 'Dakar',
        ], $overrides);
    }

    public function test_an_agency_creates_a_property_as_a_draft(): void
    {
        $owner = User::factory()->agency()->create();
        $agency = Agency::factory()->create(['user_id' => $owner->id]);

        $this->actingAs($owner, 'sanctum')
            ->postJson('/api/v1/properties', $this->payload())
            ->assertCreated()
            ->assertJsonPath('data.status', 'draft');

        $this->assertDatabaseHas('properties', [
            'agency_id' => $agency->id,
            'name' => 'Villa Almadies',
            'status' => 'draft',
        ]);
    }

    public function test_creation_validates_the_payload(): void
    {
        $owner = User::factory()->agency()->create();
        Agency::factory()->create(['user_id' => $owner->id]);

        $this->actingAs($owner, 'sanctum')
            ->postJson('/api/v1/properties', $this->payload(['name' => '', 'price' => -1]))
            ->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'price']);
    }

    public function test_a_normal_user_cannot_create_a_property(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/properties', $this->payload())
            ->assertStatus(403);
    }

    public function test_a_guest_cannot_create_a_property(): void
    {
        $this->postJson('/api/v1/properties', $this->payload())->assertStatus(401);
    }
}
