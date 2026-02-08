<?php

namespace Tests\Feature\Rental;

use App\Enums\LeaseStatus;
use App\Enums\RentalApplicationStatus;
use App\Models\Agency;
use App\Models\ContractClause;
use App\Models\ContractTemplate;
use App\Models\Lease;
use App\Models\Property;
use App\Models\RentalApplication;
use App\Models\User;
use App\Notifications\LeaseContractAvailable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class GenerateLeaseTest extends TestCase
{
    use RefreshDatabase;

    /** @return array{0: User, 1: Agency, 2: User, 3: RentalApplication} */
    private function acceptedApplication(int $rent = 150_000): array
    {
        $agencyUser = User::factory()->agency()->create();
        $agency = Agency::factory()->create(['user_id' => $agencyUser->id]);
        $property = Property::factory()->published()->forRent($rent)->create(['agency_id' => $agency->id]);
        $property->rentalDetail()->update([
            'charges_amount' => 10_000,
            'deposit_amount' => 300_000,
            'advance_months' => 2,
            'min_lease_months' => 12,
        ]);
        $client = User::factory()->create();

        $application = RentalApplication::factory()
            ->status(RentalApplicationStatus::Accepted)
            ->create([
                'property_id' => $property->id,
                'agency_id' => $agency->id,
                'applicant_user_id' => $client->id,
                'desired_duration_months' => 12,
                'desired_start_date' => '2026-09-01',
            ]);

        return [$agencyUser, $agency, $client, $application];
    }

    public function test_the_agency_generates_a_lease_from_an_accepted_application(): void
    {
        Storage::fake('local');
        Notification::fake();
        [$agencyUser, , , $application] = $this->acceptedApplication();

        $this->actingAs($agencyUser, 'sanctum')
            ->postJson("/api/v1/agency/rental-applications/{$application->id}/generate-lease")
            ->assertCreated()
            ->assertJsonPath('data.status', 'pending_validation')
            ->assertJsonPath('data.duration_months', 12);

        $lease = Lease::first();
        $this->assertMatchesRegularExpression('/^BAIL-\d{4}-\d{5}$/', $lease->reference);
    }

    public function test_the_amounts_are_frozen_and_stop_following_the_listing(): void
    {
        Storage::fake('local');
        Notification::fake();
        [$agencyUser, , , $application] = $this->acceptedApplication(rent: 150_000);

        $this->actingAs($agencyUser, 'sanctum')
            ->postJson("/api/v1/agency/rental-applications/{$application->id}/generate-lease")
            ->assertCreated();

        // RG-L09: re-pricing the property must not rewrite a running lease.
        $application->property->rentalDetail()->update(['rent_amount' => 400_000]);

        $lease = Lease::first();
        $this->assertSame(150_000, $lease->rent_amount);
        $this->assertSame(10_000, $lease->charges_amount);
        $this->assertSame(300_000, $lease->deposit_amount);
        // RG-L13: deposit + 2 x (150 000 + 10 000).
        $this->assertSame(620_000, $lease->initialPayment());
    }

    public function test_the_end_date_closes_the_last_month_rather_than_opening_the_next(): void
    {
        Storage::fake('local');
        Notification::fake();
        [$agencyUser, , , $application] = $this->acceptedApplication();

        $this->actingAs($agencyUser, 'sanctum')
            ->postJson("/api/v1/agency/rental-applications/{$application->id}/generate-lease", [
                'start_date' => '2026-09-01',
                'duration_months' => 12,
            ])
            ->assertCreated()
            ->assertJsonPath('data.start_date', '2026-09-01')
            ->assertJsonPath('data.end_date', '2027-08-31');
    }

    public function test_the_contract_pdf_is_produced_and_kept_private(): void
    {
        Storage::fake('local');
        Notification::fake();
        [$agencyUser, , , $application] = $this->acceptedApplication();

        $this->actingAs($agencyUser, 'sanctum')
            ->postJson("/api/v1/agency/rental-applications/{$application->id}/generate-lease")
            ->assertCreated()
            ->assertJsonPath('data.has_generated_contract', true)
            // The path itself never travels: the document is reachable only
            // through the policy-checked download route.
            ->assertJsonMissingPath('data.generated_contract_path');

        $lease = Lease::first();
        Storage::disk('local')->assertExists($lease->generated_contract_path);
        $this->assertStringStartsWith('%PDF', Storage::disk('local')->get($lease->generated_contract_path));
    }

    public function test_the_agency_articles_are_rendered_with_their_variables(): void
    {
        Storage::fake('local');
        Notification::fake();
        [$agencyUser, $agency, , $application] = $this->acceptedApplication();

        $template = ContractTemplate::factory()->isDefault()->create(['agency_id' => $agency->id]);
        ContractClause::factory()->create([
            'contract_template_id' => $template->id,
            'title' => 'Obligations du preneur',
            'body' => 'Le loyer de {{bail.loyer}} est payable le {{bail.jour_echeance}} de chaque mois.',
        ]);

        $this->actingAs($agencyUser, 'sanctum')
            ->postJson("/api/v1/agency/rental-applications/{$application->id}/generate-lease")
            ->assertCreated();

        $this->assertSame($template->id, Lease::first()->contract_template_id);
    }

    public function test_an_unknown_variable_stops_the_generation_instead_of_rendering_a_hole(): void
    {
        Storage::fake('local');
        Notification::fake();
        [$agencyUser, $agency, , $application] = $this->acceptedApplication();

        $template = ContractTemplate::factory()->isDefault()->create(['agency_id' => $agency->id]);
        ContractClause::factory()->create([
            'contract_template_id' => $template->id,
            'body' => 'Le loyer de {{bail.loyers}} est payable d\'avance.',
        ]);

        // A contract reading "le loyer de  est payable" is worse than no
        // contract: nobody proof-reads what they believe a machine assembled.
        $response = $this->actingAs($agencyUser, 'sanctum')
            ->postJson("/api/v1/agency/rental-applications/{$application->id}/generate-lease")
            ->assertStatus(422);

        $this->assertContains('bail.loyers', $response->json('unknown_variables'));
        $this->assertDatabaseCount('leases', 0);
    }

    public function test_an_application_that_is_not_accepted_yields_no_lease(): void
    {
        Storage::fake('local');
        [$agencyUser, , , $application] = $this->acceptedApplication();
        $application->update(['status' => RentalApplicationStatus::Submitted]);

        // RG-L08.
        $this->actingAs($agencyUser, 'sanctum')
            ->postJson("/api/v1/agency/rental-applications/{$application->id}/generate-lease")
            ->assertStatus(409);

        $this->assertDatabaseCount('leases', 0);
    }

    public function test_a_duration_below_the_property_minimum_is_refused(): void
    {
        Storage::fake('local');
        [$agencyUser, , , $application] = $this->acceptedApplication();

        // RG-L10.
        $this->actingAs($agencyUser, 'sanctum')
            ->postJson("/api/v1/agency/rental-applications/{$application->id}/generate-lease", [
                'duration_months' => 6,
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['duration_months']);
    }

    public function test_the_tenant_is_told_the_contract_is_ready(): void
    {
        Storage::fake('local');
        Notification::fake();
        [$agencyUser, , $client, $application] = $this->acceptedApplication();

        $this->actingAs($agencyUser, 'sanctum')
            ->postJson("/api/v1/agency/rental-applications/{$application->id}/generate-lease")
            ->assertCreated();

        Notification::assertSentTo($client, LeaseContractAvailable::class);
    }

    public function test_another_agency_cannot_generate_the_lease(): void
    {
        Storage::fake('local');
        [, , , $application] = $this->acceptedApplication();
        $stranger = User::factory()->agency()->create();
        Agency::factory()->create(['user_id' => $stranger->id]);

        $this->actingAs($stranger, 'sanctum')
            ->postJson("/api/v1/agency/rental-applications/{$application->id}/generate-lease")
            ->assertStatus(403);
    }

    public function test_the_candidate_cannot_generate_their_own_lease(): void
    {
        Storage::fake('local');
        [, , $client, $application] = $this->acceptedApplication();

        $this->actingAs($client, 'sanctum')
            ->postJson("/api/v1/agency/rental-applications/{$application->id}/generate-lease")
            ->assertStatus(403);
    }

    public function test_a_guest_cannot_generate_a_lease(): void
    {
        [, , , $application] = $this->acceptedApplication();

        $this->postJson("/api/v1/agency/rental-applications/{$application->id}/generate-lease")
            ->assertStatus(401);
    }

    public function test_the_generated_lease_waits_for_the_tenant(): void
    {
        Storage::fake('local');
        Notification::fake();
        [$agencyUser, , , $application] = $this->acceptedApplication();

        $this->actingAs($agencyUser, 'sanctum')
            ->postJson("/api/v1/agency/rental-applications/{$application->id}/generate-lease")
            ->assertCreated();

        $this->assertSame(LeaseStatus::PendingValidation, Lease::first()->status);
    }
}
