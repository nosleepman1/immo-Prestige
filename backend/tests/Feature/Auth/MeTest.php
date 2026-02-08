<?php

namespace Tests\Feature\Auth;

use App\Models\Agency;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MeTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_returns_the_authenticated_user_and_their_agency(): void
    {
        $user = User::factory()->agency()->create();
        $agency = Agency::factory()->create(['user_id' => $user->id]);

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/user')
            ->assertOk()
            ->assertJsonPath('data.user.id', $user->id)
            ->assertJsonPath('data.agency.id', $agency->id);
    }

    public function test_a_user_without_agency_gets_null_agency(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/user')
            ->assertOk()
            ->assertJsonPath('data.agency', null);
    }

    public function test_a_guest_cannot_access_me(): void
    {
        $this->getJson('/api/v1/user')->assertStatus(401);
    }
}
