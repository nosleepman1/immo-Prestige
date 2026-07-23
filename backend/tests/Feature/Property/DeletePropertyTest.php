<?php

namespace Tests\Feature\Property;

use App\Models\Agency;
use App\Models\Property;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DeletePropertyTest extends TestCase
{
    use RefreshDatabase;

    public function test_the_owning_agency_can_soft_delete_its_property(): void
    {
        $owner = User::factory()->agency()->create();
        $agency = Agency::factory()->create(['user_id' => $owner->id]);
        $property = Property::factory()->create(['agency_id' => $agency->id]);

        $this->actingAs($owner, 'sanctum')
            ->deleteJson("/api/v1/properties/{$property->id}")
            ->assertNoContent();

        $this->assertSoftDeleted('properties', ['id' => $property->id]);
    }

    public function test_another_agency_cannot_delete_the_property(): void
    {
        $property = Property::factory()->create();
        $intruder = User::factory()->agency()->create();

        $this->actingAs($intruder, 'sanctum')
            ->deleteJson("/api/v1/properties/{$property->id}")
            ->assertStatus(403);

        $this->assertDatabaseHas('properties', ['id' => $property->id, 'deleted_at' => null]);
    }

    public function test_a_guest_cannot_delete_a_property(): void
    {
        $property = Property::factory()->create();

        $this->deleteJson("/api/v1/properties/{$property->id}")->assertStatus(401);
    }

    public function test_deleting_a_missing_property_returns_404(): void
    {
        $owner = User::factory()->agency()->create();

        $this->actingAs($owner, 'sanctum')
            ->deleteJson('/api/v1/properties/999999')
            ->assertStatus(404);
    }
}
