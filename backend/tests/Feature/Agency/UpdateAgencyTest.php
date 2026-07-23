<?php

namespace Tests\Feature\Agency;

use App\Models\Agency;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UpdateAgencyTest extends TestCase
{
    use RefreshDatabase;

    public function test_the_owner_can_update_their_agency(): void
    {
        $owner = User::factory()->agency()->create();
        $agency = Agency::factory()->create(['user_id' => $owner->id]);

        $this->actingAs($owner, 'sanctum')
            ->putJson("/api/v1/agency/{$agency->id}", ['city' => 'Dakar'])
            ->assertOk()
            ->assertJsonPath('data.city', 'Dakar');

        $this->assertDatabaseHas('agencies', ['id' => $agency->id, 'city' => 'Dakar']);
    }

    public function test_a_non_owner_cannot_update_an_agency(): void
    {
        $agency = Agency::factory()->create(['city' => 'Thies']);
        $intruder = User::factory()->agency()->create();

        $this->actingAs($intruder, 'sanctum')
            ->putJson("/api/v1/agency/{$agency->id}", ['city' => 'Hacked'])
            ->assertStatus(403);

        $this->assertDatabaseHas('agencies', ['id' => $agency->id, 'city' => 'Thies']);
    }

    public function test_a_guest_cannot_update_an_agency(): void
    {
        $agency = Agency::factory()->create();

        $this->putJson("/api/v1/agency/{$agency->id}", ['city' => 'X'])
            ->assertStatus(401);
    }

    public function test_update_validates_the_payload(): void
    {
        $owner = User::factory()->agency()->create();
        $agency = Agency::factory()->create(['user_id' => $owner->id]);

        $this->actingAs($owner, 'sanctum')
            ->putJson("/api/v1/agency/{$agency->id}", ['company_name' => ''])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['company_name']);
    }

    public function test_updating_a_missing_agency_returns_404(): void
    {
        $owner = User::factory()->agency()->create();

        $this->actingAs($owner, 'sanctum')
            ->putJson('/api/v1/agency/999999', ['city' => 'X'])
            ->assertStatus(404);
    }
}
