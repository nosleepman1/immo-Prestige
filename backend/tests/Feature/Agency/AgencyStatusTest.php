<?php

namespace Tests\Feature\Agency;

use App\Mail\NewAgencyRequestMail;
use App\Models\Agency;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class AgencyStatusTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_pending_agency_can_view_its_own_status_without_a_password(): void
    {
        $user = User::factory()->agency()->create(['password' => null]);
        Agency::factory()->pending()->create(['user_id' => $user->id]);

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/agency/me')
            ->assertOk()
            ->assertJsonPath('data.status', 'pending');
    }

    public function test_a_guest_cannot_view_agency_status(): void
    {
        $this->getJson('/api/v1/agency/me')->assertStatus(401);
    }

    public function test_a_refused_agency_can_resubmit(): void
    {
        Mail::fake();
        User::factory()->admin()->create();
        $user = User::factory()->agency()->create(['password' => null]);
        $agency = Agency::factory()->refused()->create(['user_id' => $user->id]);

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/agency/resubmit', ['description' => 'Dossier corrigé'])
            ->assertOk()
            ->assertJsonPath('data.status', 'pending');

        $this->assertDatabaseHas('agencies', ['id' => $agency->id, 'status' => 'pending', 'refusal_reason' => null]);
        Mail::assertQueued(NewAgencyRequestMail::class);
    }

    public function test_a_non_refused_agency_cannot_resubmit(): void
    {
        $user = User::factory()->agency()->create();
        Agency::factory()->pending()->create(['user_id' => $user->id]);

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/agency/resubmit', ['description' => 'x'])
            ->assertStatus(409)
            ->assertJsonPath('code', 'AGENCY_NOT_REFUSED');
    }
}
