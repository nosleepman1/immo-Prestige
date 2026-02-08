<?php

namespace Tests\Feature\Agency;

use App\Models\Agency;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DeleteAgencyTest extends TestCase
{
    use RefreshDatabase;

    public function test_the_owner_can_soft_delete_their_agency(): void
    {
        $owner = User::factory()->agency()->create();
        $agency = Agency::factory()->create(['user_id' => $owner->id]);

        $this->actingAs($owner, 'sanctum')
            ->deleteJson("/api/v1/agency/{$agency->id}")
            ->assertNoContent();

        $this->assertSoftDeleted('agencies', ['id' => $agency->id]);
    }

    public function test_a_non_owner_cannot_delete_an_agency(): void
    {
        $agency = Agency::factory()->create();
        $intruder = User::factory()->agency()->create();

        $this->actingAs($intruder, 'sanctum')
            ->deleteJson("/api/v1/agency/{$agency->id}")
            ->assertStatus(403);

        $this->assertDatabaseHas('agencies', ['id' => $agency->id, 'deleted_at' => null]);
    }

    public function test_a_guest_cannot_delete_an_agency(): void
    {
        $agency = Agency::factory()->create();

        $this->deleteJson("/api/v1/agency/{$agency->id}")->assertStatus(401);
    }

    public function test_deleting_a_missing_agency_returns_404(): void
    {
        $owner = User::factory()->agency()->create();

        $this->actingAs($owner, 'sanctum')
            ->deleteJson('/api/v1/agency/999999')
            ->assertStatus(404);
    }
}
