<?php

namespace Tests\Feature\Rental;

use App\Enums\PropertyAvailability;
use App\Enums\RentalApplicationStatus;
use App\Models\Agency;
use App\Models\Property;
use App\Models\RentalApplication;
use App\Models\User;
use App\Notifications\RentalApplicationSubmitted;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class SubmitRentalApplicationTest extends TestCase
{
    use RefreshDatabase;

    /** @return array{0: User, 1: Agency} */
    private function agency(): array
    {
        $user = User::factory()->agency()->create();

        return [$user, Agency::factory()->create(['user_id' => $user->id])];
    }

    private function rentalProperty(Agency $agency, int $minMonths = 12): Property
    {
        $property = Property::factory()->published()->forRent()->create(['agency_id' => $agency->id]);
        $property->rentalDetail()->update(['min_lease_months' => $minMonths]);

        return $property;
    }

    /** @param array<string, mixed> $overrides */
    private function payload(Property $property, array $overrides = []): array
    {
        return array_merge([
            'property_id' => $property->id,
            'desired_start_date' => now()->addMonth()->toDateString(),
            'desired_duration_months' => 12,
            'message' => 'Bonjour, je suis intéressé par ce logement.',
        ], $overrides);
    }

    public function test_a_client_submits_an_application(): void
    {
        Notification::fake();
        [, $agency] = $this->agency();
        $property = $this->rentalProperty($agency);
        $client = User::factory()->create();

        $this->actingAs($client, 'sanctum')
            ->postJson('/api/v1/rental-applications', $this->payload($property))
            ->assertCreated()
            ->assertJsonPath('data.status', 'submitted');

        $this->assertDatabaseHas('rental_applications', [
            'property_id' => $property->id,
            'applicant_user_id' => $client->id,
            // Denormalised from the property so the agency queue never joins.
            'agency_id' => $agency->id,
            'status' => 'submitted',
        ]);
    }

    public function test_the_agency_is_notified_on_every_channel(): void
    {
        Notification::fake();
        [$agencyUser, $agency] = $this->agency();
        $property = $this->rentalProperty($agency);
        $client = User::factory()->create();

        $this->actingAs($client, 'sanctum')
            ->postJson('/api/v1/rental-applications', $this->payload($property))
            ->assertCreated();

        Notification::assertSentTo($agencyUser, RentalApplicationSubmitted::class,
            function (RentalApplicationSubmitted $notification) use ($agencyUser) {
                $channels = $notification->via($agencyUser);

                // An unattended application loses a client: this one is mailed.
                return in_array('database', $channels, true)
                    && in_array('broadcast', $channels, true)
                    && in_array('mail', $channels, true);
            });
    }

    public function test_the_candidate_is_not_notified_of_their_own_submission(): void
    {
        Notification::fake();
        [, $agency] = $this->agency();
        $property = $this->rentalProperty($agency);
        $client = User::factory()->create();

        $this->actingAs($client, 'sanctum')
            ->postJson('/api/v1/rental-applications', $this->payload($property))
            ->assertCreated();

        Notification::assertNotSentTo($client, RentalApplicationSubmitted::class);
    }

    public function test_an_unpublished_property_accepts_no_application(): void
    {
        [, $agency] = $this->agency();
        $property = Property::factory()->draft()->forRent()->create(['agency_id' => $agency->id]);
        $client = User::factory()->create();

        $this->actingAs($client, 'sanctum')
            ->postJson('/api/v1/rental-applications', $this->payload($property))
            ->assertStatus(422);

        $this->assertDatabaseCount('rental_applications', 0);
    }

    public function test_a_sale_only_property_accepts_no_application(): void
    {
        [, $agency] = $this->agency();
        $property = Property::factory()->published()->forSale()->create(['agency_id' => $agency->id]);
        $client = User::factory()->create();

        $this->actingAs($client, 'sanctum')
            ->postJson('/api/v1/rental-applications', $this->payload($property))
            ->assertStatus(422);
    }

    public function test_an_already_rented_property_accepts_no_application(): void
    {
        [, $agency] = $this->agency();
        $property = $this->rentalProperty($agency);
        $property->update(['availability' => PropertyAvailability::Rented]);
        $client = User::factory()->create();

        $this->actingAs($client, 'sanctum')
            ->postJson('/api/v1/rental-applications', $this->payload($property))
            ->assertStatus(422);
    }

    public function test_a_duration_below_the_minimum_is_refused_at_the_door(): void
    {
        [, $agency] = $this->agency();
        $property = $this->rentalProperty($agency, minMonths: 24);
        $client = User::factory()->create();

        // Told now, rather than after the candidate assembled a full file.
        $this->actingAs($client, 'sanctum')
            ->postJson('/api/v1/rental-applications', $this->payload($property, ['desired_duration_months' => 12]))
            ->assertStatus(422);
    }

    public function test_a_candidate_cannot_have_two_live_applications_on_one_property(): void
    {
        [, $agency] = $this->agency();
        $property = $this->rentalProperty($agency);
        $client = User::factory()->create();

        $this->actingAs($client, 'sanctum')
            ->postJson('/api/v1/rental-applications', $this->payload($property))
            ->assertCreated();

        $this->actingAs($client, 'sanctum')
            ->postJson('/api/v1/rental-applications', $this->payload($property))
            ->assertStatus(409);

        $this->assertDatabaseCount('rental_applications', 1);
    }

    public function test_a_new_application_is_allowed_after_a_refusal(): void
    {
        [, $agency] = $this->agency();
        $property = $this->rentalProperty($agency);
        $client = User::factory()->create();

        RentalApplication::factory()->rejected()->create([
            'property_id' => $property->id,
            'agency_id' => $agency->id,
            'applicant_user_id' => $client->id,
        ]);

        // The partial index only counts live applications, so a second chance
        // stays possible.
        $this->actingAs($client, 'sanctum')
            ->postJson('/api/v1/rental-applications', $this->payload($property))
            ->assertCreated();

        $this->assertDatabaseCount('rental_applications', 2);
    }

    public function test_two_different_candidates_may_apply_to_the_same_property(): void
    {
        [, $agency] = $this->agency();
        $property = $this->rentalProperty($agency);

        foreach ([User::factory()->create(), User::factory()->create()] as $client) {
            $this->actingAs($client, 'sanctum')
                ->postJson('/api/v1/rental-applications', $this->payload($property))
                ->assertCreated();
        }

        $this->assertDatabaseCount('rental_applications', 2);
    }

    public function test_an_agency_account_cannot_apply(): void
    {
        [$agencyUser, $agency] = $this->agency();
        $property = $this->rentalProperty($agency);

        $this->actingAs($agencyUser, 'sanctum')
            ->postJson('/api/v1/rental-applications', $this->payload($property))
            ->assertStatus(403);
    }

    public function test_a_guest_cannot_apply(): void
    {
        [, $agency] = $this->agency();
        $property = $this->rentalProperty($agency);

        $this->postJson('/api/v1/rental-applications', $this->payload($property))->assertStatus(401);
    }

    public function test_submission_validates_the_payload(): void
    {
        [, $agency] = $this->agency();
        $property = $this->rentalProperty($agency);
        $client = User::factory()->create();

        $this->actingAs($client, 'sanctum')
            ->postJson('/api/v1/rental-applications', $this->payload($property, [
                'desired_start_date' => now()->subMonth()->toDateString(),
                'desired_duration_months' => 0,
            ]))
            ->assertStatus(422)
            ->assertJsonValidationErrors(['desired_start_date', 'desired_duration_months']);
    }

    public function test_a_candidate_cancels_their_own_application(): void
    {
        [, $agency] = $this->agency();
        $client = User::factory()->create();
        $application = RentalApplication::factory()->create([
            'property_id' => $this->rentalProperty($agency)->id,
            'agency_id' => $agency->id,
            'applicant_user_id' => $client->id,
        ]);

        $this->actingAs($client, 'sanctum')
            ->deleteJson("/api/v1/rental-applications/{$application->id}")
            ->assertOk()
            ->assertJsonPath('data.status', 'cancelled');

        // Kept as history, but it no longer blocks a future application.
        $this->assertDatabaseHas('rental_applications', [
            'id' => $application->id,
            'status' => RentalApplicationStatus::Cancelled->value,
        ]);
    }

    public function test_a_candidate_cannot_cancel_someone_elses_application(): void
    {
        [, $agency] = $this->agency();
        $application = RentalApplication::factory()->create([
            'property_id' => $this->rentalProperty($agency)->id,
            'agency_id' => $agency->id,
        ]);

        $this->actingAs(User::factory()->create(), 'sanctum')
            ->deleteJson("/api/v1/rental-applications/{$application->id}")
            ->assertStatus(403);
    }
}
