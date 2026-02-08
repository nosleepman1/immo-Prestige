<?php

namespace Tests\Feature\Admin;

use App\Mail\AgencyAcceptedMail;
use App\Models\Agency;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class ReviewAgencyTest extends TestCase
{
    use RefreshDatabase;

    public function test_an_admin_can_list_pending_agencies(): void
    {
        $admin = User::factory()->admin()->create();
        Agency::factory()->pending()->count(2)->create();
        Agency::factory()->create(); // accepted, must not appear

        $this->actingAs($admin, 'sanctum')
            ->getJson('/api/v1/admin/agencies?status=pending')
            ->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_a_non_admin_cannot_list_agencies(): void
    {
        $agency = User::factory()->agency()->create();

        $this->actingAs($agency, 'sanctum')
            ->getJson('/api/v1/admin/agencies')
            ->assertStatus(403);
    }

    public function test_an_admin_can_accept_a_pending_agency(): void
    {
        Mail::fake();
        $admin = User::factory()->admin()->create();
        $agency = Agency::factory()->pending()->create();

        $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/admin/agencies/{$agency->id}/accept")
            ->assertOk()
            ->assertJsonPath('data.status', 'accepted');

        $this->assertDatabaseHas('agencies', ['id' => $agency->id, 'status' => 'accepted', 'reviewed_by' => $admin->id]);
        $this->assertDatabaseCount('password_setup_tokens', 1);
        Mail::assertQueued(AgencyAcceptedMail::class);
    }

    public function test_accepting_an_already_reviewed_agency_is_rejected(): void
    {
        Mail::fake();
        $admin = User::factory()->admin()->create();
        $agency = Agency::factory()->create(); // already accepted

        $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/admin/agencies/{$agency->id}/accept")
            ->assertStatus(409)
            ->assertJsonPath('code', 'ALREADY_REVIEWED');

        $this->assertDatabaseCount('password_setup_tokens', 0);
        Mail::assertNothingQueued();
    }

    public function test_an_admin_can_refuse_with_a_reason(): void
    {
        $admin = User::factory()->admin()->create();
        $agency = Agency::factory()->pending()->create();

        $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/admin/agencies/{$agency->id}/refuse", ['reason' => 'Documents illisibles'])
            ->assertOk()
            ->assertJsonPath('data.status', 'refused');

        $this->assertDatabaseHas('agencies', ['id' => $agency->id, 'status' => 'refused', 'refusal_reason' => 'Documents illisibles']);
    }

    public function test_refusal_requires_a_reason(): void
    {
        $admin = User::factory()->admin()->create();
        $agency = Agency::factory()->pending()->create();

        $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/admin/agencies/{$agency->id}/refuse", [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['reason']);
    }

    public function test_a_guest_cannot_review(): void
    {
        $agency = Agency::factory()->pending()->create();

        $this->postJson("/api/v1/admin/agencies/{$agency->id}/accept")->assertStatus(401);
    }

    public function test_reviewing_a_missing_agency_returns_404(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin, 'sanctum')
            ->postJson('/api/v1/admin/agencies/999999/accept')
            ->assertStatus(404);

        $this->actingAs($admin, 'sanctum')
            ->postJson('/api/v1/admin/agencies/999999/refuse', ['reason' => 'x'])
            ->assertStatus(404);
    }
}
