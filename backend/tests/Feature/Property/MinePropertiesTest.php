<?php

namespace Tests\Feature\Property;

use App\Models\Agency;
use App\Models\Property;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MinePropertiesTest extends TestCase
{
    use RefreshDatabase;

    public function test_an_agency_lists_only_its_own_properties_any_status(): void
    {
        $owner = User::factory()->agency()->create();
        $agency = Agency::factory()->create(['user_id' => $owner->id]);
        Property::factory()->draft()->create(['agency_id' => $agency->id]);
        Property::factory()->published()->create(['agency_id' => $agency->id]);
        Property::factory()->published()->create(); // another agency

        $this->actingAs($owner, 'sanctum')
            ->getJson('/api/v1/properties/mine')
            ->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_a_normal_user_cannot_list_agency_properties(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/properties/mine')
            ->assertStatus(403);
    }

    public function test_a_guest_cannot_list_agency_properties(): void
    {
        $this->getJson('/api/v1/properties/mine')->assertStatus(401);
    }
}
