<?php

namespace Tests\Feature\Property;

use App\Models\Agency;
use App\Models\Property;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UpdatePropertyTest extends TestCase
{
    use RefreshDatabase;

    public function test_the_owning_agency_can_update_its_property(): void
    {
        $owner = User::factory()->agency()->create();
        $agency = Agency::factory()->create(['user_id' => $owner->id]);
        $property = Property::factory()->create(['agency_id' => $agency->id, 'name' => 'Old']);

        $this->actingAs($owner, 'sanctum')
            ->putJson("/api/v1/properties/{$property->id}", ['name' => 'Villa Neuve'])
            ->assertOk()
            ->assertJsonPath('data.name', 'Villa Neuve');

        $this->assertDatabaseHas('properties', ['id' => $property->id, 'name' => 'Villa Neuve']);
    }

    public function test_another_agency_cannot_update_the_property(): void
    {
        $property = Property::factory()->create(['name' => 'Original']);
        $intruder = User::factory()->agency()->create();

        $this->actingAs($intruder, 'sanctum')
            ->putJson("/api/v1/properties/{$property->id}", ['name' => 'Hacked'])
            ->assertStatus(403);

        $this->assertDatabaseHas('properties', ['id' => $property->id, 'name' => 'Original']);
    }

    public function test_a_guest_cannot_update_a_property(): void
    {
        $property = Property::factory()->create();

        $this->putJson("/api/v1/properties/{$property->id}", ['name' => 'X'])
            ->assertStatus(401);
    }

    public function test_update_validates_the_payload(): void
    {
        $owner = User::factory()->agency()->create();
        $agency = Agency::factory()->create(['user_id' => $owner->id]);
        $property = Property::factory()->create(['agency_id' => $agency->id]);

        $this->actingAs($owner, 'sanctum')
            ->putJson("/api/v1/properties/{$property->id}", ['price' => -5])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['price']);
    }

    public function test_update_rejects_out_of_range_coordinates(): void
    {
        $owner = User::factory()->agency()->create();
        $agency = Agency::factory()->create(['user_id' => $owner->id]);
        $property = Property::factory()->create(['agency_id' => $agency->id]);

        $this->actingAs($owner, 'sanctum')
            ->putJson("/api/v1/properties/{$property->id}", ['latitude' => 200])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['latitude']);
    }

    public function test_updating_a_missing_property_returns_404(): void
    {
        $owner = User::factory()->agency()->create();

        $this->actingAs($owner, 'sanctum')
            ->putJson('/api/v1/properties/999999', ['name' => 'X'])
            ->assertStatus(404);
    }
}
