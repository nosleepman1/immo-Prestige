<?php

namespace Tests\Feature\Rental;

use App\Enums\RentalApplicationStatus;
use App\Models\Agency;
use App\Models\Property;
use App\Models\RentalApplication;
use App\Models\User;
use App\Notifications\RentalApplicationAccepted;
use App\Notifications\RentalApplicationDocumentsRequested;
use App\Notifications\RentalApplicationRejected;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class ReviewRentalApplicationTest extends TestCase
{
    use RefreshDatabase;

    /** @return array{0: User, 1: Agency} */
    private function agency(): array
    {
        $user = User::factory()->agency()->create();

        return [$user, Agency::factory()->create(['user_id' => $user->id])];
    }

    /** @return array{0: User, 1: Agency, 2: User, 3: RentalApplication} */
    private function pendingApplication(): array
    {
        [$agencyUser, $agency] = $this->agency();
        $property = Property::factory()->published()->forRent()->create(['agency_id' => $agency->id]);
        // Pinned: the factory draws 12, 24 or 36, and the tests below re-apply
        // for 12 months — leaving it random makes them pass by luck.
        $property->rentalDetail()->update(['min_lease_months' => 12]);
        $client = User::factory()->create();

        $application = RentalApplication::factory()->create([
            'property_id' => $property->id,
            'agency_id' => $agency->id,
            'applicant_user_id' => $client->id,
        ]);

        return [$agencyUser, $agency, $client, $application];
    }

    public function test_the_agency_accepts_an_application(): void
    {
        Notification::fake();
        [$agencyUser, , $client, $application] = $this->pendingApplication();

        $this->actingAs($agencyUser, 'sanctum')
            ->postJson("/api/v1/agency/rental-applications/{$application->id}/accept")
            ->assertOk()
            ->assertJsonPath('data.status', 'accepted');

        $this->assertDatabaseHas('rental_applications', [
            'id' => $application->id,
            'status' => RentalApplicationStatus::Accepted->value,
            // Who decided and when: the audit trail the agency will be asked for.
            'reviewed_by' => $agencyUser->id,
        ]);
        $this->assertNotNull($application->fresh()->reviewed_at);

        Notification::assertSentTo($client, RentalApplicationAccepted::class);
    }

    public function test_the_agency_rejects_an_application_with_a_reason(): void
    {
        Notification::fake();
        [$agencyUser, , $client, $application] = $this->pendingApplication();

        $this->actingAs($agencyUser, 'sanctum')
            ->postJson("/api/v1/agency/rental-applications/{$application->id}/reject", [
                'rejection_reason' => 'Revenus insuffisants au regard du loyer demandé.',
            ])
            ->assertOk()
            ->assertJsonPath('data.status', 'rejected');

        Notification::assertSentTo($client, RentalApplicationRejected::class,
            function (RentalApplicationRejected $notification) {
                // The reason travels with the notification: the rejection mail
                // quotes it, so an empty one would be a silent insult.
                return str_contains($notification->application->rejection_reason, 'Revenus insuffisants');
            });
    }

    public function test_a_rejection_without_a_reason_is_refused(): void
    {
        [$agencyUser, , , $application] = $this->pendingApplication();

        // RG-L07: the candidate is owed an explanation.
        $this->actingAs($agencyUser, 'sanctum')
            ->postJson("/api/v1/agency/rental-applications/{$application->id}/reject", [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['rejection_reason']);

        $this->assertDatabaseHas('rental_applications', [
            'id' => $application->id,
            'status' => RentalApplicationStatus::Submitted->value,
        ]);
    }

    public function test_the_agency_requests_further_documents(): void
    {
        Notification::fake();
        [$agencyUser, , $client, $application] = $this->pendingApplication();

        $this->actingAs($agencyUser, 'sanctum')
            ->postJson("/api/v1/agency/rental-applications/{$application->id}/request-documents", [
                'requested_documents' => 'Trois derniers bulletins de salaire.',
            ])
            ->assertOk()
            ->assertJsonPath('data.status', 'documents_requested');

        Notification::assertSentTo($client, RentalApplicationDocumentsRequested::class);
    }

    public function test_requesting_documents_keeps_the_application_blocking(): void
    {
        Notification::fake();
        [$agencyUser, $agency, $client, $application] = $this->pendingApplication();

        $this->actingAs($agencyUser, 'sanctum')
            ->postJson("/api/v1/agency/rental-applications/{$application->id}/request-documents", [
                'requested_documents' => 'Attestation de travail.',
            ])->assertOk();

        // The ball is in the candidate's court, but the file is still live: a
        // second application on the same property stays refused.
        $this->actingAs($client, 'sanctum')
            ->postJson('/api/v1/rental-applications', [
                'property_id' => $application->property_id,
                'desired_start_date' => now()->addMonth()->toDateString(),
                'desired_duration_months' => 12,
            ])
            ->assertStatus(409);
    }

    public function test_an_already_decided_application_cannot_be_reviewed_again(): void
    {
        Notification::fake();
        [$agencyUser, , , $application] = $this->pendingApplication();
        $application->update(['status' => RentalApplicationStatus::Accepted]);

        $this->actingAs($agencyUser, 'sanctum')
            ->postJson("/api/v1/agency/rental-applications/{$application->id}/reject", [
                'rejection_reason' => 'Changement d\'avis.',
            ])
            ->assertStatus(409);
    }

    public function test_another_agency_cannot_instruct_the_application(): void
    {
        [$otherAgencyUser] = $this->agency();
        [, , , $application] = $this->pendingApplication();

        // RG-L06: only the agency owning the property instructs.
        $this->actingAs($otherAgencyUser, 'sanctum')
            ->postJson("/api/v1/agency/rental-applications/{$application->id}/accept")
            ->assertStatus(403);
    }

    public function test_the_candidate_cannot_accept_their_own_application(): void
    {
        [, , $client, $application] = $this->pendingApplication();

        $this->actingAs($client, 'sanctum')
            ->postJson("/api/v1/agency/rental-applications/{$application->id}/accept")
            ->assertStatus(403);
    }

    public function test_a_guest_cannot_instruct_an_application(): void
    {
        [, , , $application] = $this->pendingApplication();

        $this->postJson("/api/v1/agency/rental-applications/{$application->id}/accept")->assertStatus(401);
    }

    public function test_an_unknown_application_is_a_404(): void
    {
        [$agencyUser] = $this->agency();

        $this->actingAs($agencyUser, 'sanctum')
            ->postJson('/api/v1/agency/rental-applications/999999/accept')
            ->assertStatus(404);
    }

    public function test_the_queue_lists_only_the_agencys_own_applications(): void
    {
        [$agencyUser, $agency, , ] = $this->pendingApplication();
        // Another agency's application must not appear.
        $this->pendingApplication();

        $this->actingAs($agencyUser, 'sanctum')
            ->getJson('/api/v1/agency/rental-applications')
            ->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_the_queue_filters_by_status(): void
    {
        [$agencyUser, $agency, , $application] = $this->pendingApplication();
        RentalApplication::factory()->rejected()->create([
            'property_id' => $application->property_id,
            'agency_id' => $agency->id,
        ]);

        $this->actingAs($agencyUser, 'sanctum')
            ->getJson('/api/v1/agency/rental-applications?status=submitted')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.status', 'submitted');
    }
}
