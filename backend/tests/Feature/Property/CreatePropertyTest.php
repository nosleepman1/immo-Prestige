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
            'transaction_type' => 'sale',
            'sale' => ['price' => 750000],
            'country' => 'Sénégal',
            'region' => 'Dakar',
            'city' => 'Dakar',
        ], $overrides);
    }

    public function test_an_agency_creates_a_property_as_a_draft(): void
    {
        $owner = User::factory()->agency()->create();
        $agency = Agency::factory()->create(['user_id' => $owner->id]);

        $response = $this->actingAs($owner, 'sanctum')
            ->postJson('/api/v1/properties', $this->payload())
            ->assertCreated()
            ->assertJsonPath('data.status', 'draft')
            ->assertJsonPath('data.availability', 'available')
            ->assertJsonPath('data.sale.price', 750000);

        $this->assertDatabaseHas('properties', [
            'agency_id' => $agency->id,
            'name' => 'Villa Almadies',
            'status' => 'draft',
            'transaction_type' => 'sale',
            'availability' => 'available',
        ]);

        // The specialisation row is written in the same transaction as the trunk.
        $this->assertDatabaseHas('property_sale_details', [
            'property_id' => $response->json('data.id'),
            'price' => 750000,
        ]);
        $this->assertDatabaseCount('property_rental_details', 0);
    }

    public function test_creation_validates_the_payload(): void
    {
        $owner = User::factory()->agency()->create();
        Agency::factory()->create(['user_id' => $owner->id]);

        $this->actingAs($owner, 'sanctum')
            ->postJson('/api/v1/properties', $this->payload(['name' => '', 'sale' => ['price' => -1]]))
            ->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'sale.price']);
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
