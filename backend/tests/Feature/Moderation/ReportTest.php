<?php

namespace Tests\Feature\Moderation;

use App\Models\Comment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReportTest extends TestCase
{
    use RefreshDatabase;

    public function test_any_authenticated_role_can_report_a_comment(): void
    {
        $user = User::factory()->create();
        $comment = Comment::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/reports', [
                'reportable_type' => 'comment',
                'reportable_id' => $comment->id,
                'reason' => 'spam',
                'details' => 'Contenu publicitaire.',
            ])
            ->assertCreated()
            ->assertJsonPath('data.status', 'pending');

        $this->assertDatabaseHas('reports', [
            'reporter_id' => $user->id,
            'reportable_id' => $comment->id,
            'reason' => 'spam',
        ]);
    }

    public function test_report_creation_validates_the_payload(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/reports', [
                'reportable_type' => 'comment',
                'reportable_id' => 999999,
                'reason' => 'not-a-real-reason',
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['reportable_id', 'reason']);
    }

    public function test_a_guest_cannot_report(): void
    {
        $comment = Comment::factory()->create();

        $this->postJson('/api/v1/reports', [
            'reportable_type' => 'comment',
            'reportable_id' => $comment->id,
            'reason' => 'spam',
        ])->assertStatus(401);
    }

    public function test_an_admin_can_list_reports_filtered_by_status(): void
    {
        $admin = User::factory()->admin()->create();
        \App\Models\Report::factory()->create(['status' => 'pending']);
        \App\Models\Report::factory()->create(['status' => 'reviewed']);

        $this->actingAs($admin, 'sanctum')
            ->getJson('/api/v1/admin/reports?status=pending')
            ->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_a_non_admin_cannot_list_reports(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/admin/reports')
            ->assertStatus(403);
    }

    public function test_an_admin_can_review_a_report(): void
    {
        $admin = User::factory()->admin()->create();
        $report = \App\Models\Report::factory()->create(['status' => 'pending']);

        $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/v1/admin/reports/{$report->id}/review", ['status' => 'dismissed'])
            ->assertOk()
            ->assertJsonPath('data.status', 'dismissed');
    }

    public function test_review_validates_the_status(): void
    {
        $admin = User::factory()->admin()->create();
        $report = \App\Models\Report::factory()->create();

        $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/v1/admin/reports/{$report->id}/review", ['status' => 'pending'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['status']);
    }

    public function test_a_non_admin_cannot_review_a_report(): void
    {
        $user = User::factory()->create();
        $report = \App\Models\Report::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->patchJson("/api/v1/admin/reports/{$report->id}/review", ['status' => 'dismissed'])
            ->assertStatus(403);
    }

    public function test_reviewing_a_missing_report_returns_404(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin, 'sanctum')
            ->patchJson('/api/v1/admin/reports/999999/review', ['status' => 'dismissed'])
            ->assertStatus(404);
    }
}
