<?php

namespace Tests\Feature\Rental;

use App\Models\Agency;
use App\Models\Property;
use App\Models\RentalApplication;
use App\Models\User;
use App\Notifications\RentalApplicationAccepted;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * The three channels are wired here, on the first notification, rather than
 * revisited event by event later.
 */
class NotificationStreamTest extends TestCase
{
    use RefreshDatabase;

    private function notifiedClient(): User
    {
        $agencyUser = User::factory()->agency()->create();
        $agency = Agency::factory()->create(['user_id' => $agencyUser->id]);
        $property = Property::factory()->published()->forRent()->create(['agency_id' => $agency->id]);
        $client = User::factory()->create();

        $application = RentalApplication::factory()->create([
            'property_id' => $property->id,
            'agency_id' => $agency->id,
            'applicant_user_id' => $client->id,
        ]);

        $client->notify(new RentalApplicationAccepted($application->load('property')));

        return $client;
    }

    public function test_a_notification_is_persisted_for_later(): void
    {
        $client = $this->notifiedClient();

        // The `database` channel is what makes an event survive a closed app.
        $this->assertDatabaseCount('notifications', 1);

        $this->actingAs($client, 'sanctum')
            ->getJson('/api/v1/notifications')
            ->assertOk()
            ->assertJsonPath('data.0.key', 'rental_application.accepted')
            ->assertJsonPath('meta.unread_count', 1);
    }

    public function test_the_payload_carries_what_the_client_needs_to_route(): void
    {
        $client = $this->notifiedClient();

        $this->actingAs($client, 'sanctum')
            ->getJson('/api/v1/notifications')
            ->assertOk()
            ->assertJsonStructure([
                'data' => [['id', 'key', 'title', 'data' => ['rental_application_id', 'property_id']]],
            ]);
    }

    public function test_a_notification_can_be_marked_as_read(): void
    {
        $client = $this->notifiedClient();
        $id = $client->notifications()->first()->id;

        $this->actingAs($client, 'sanctum')
            ->postJson("/api/v1/notifications/{$id}/read")
            ->assertNoContent();

        $this->actingAs($client, 'sanctum')
            ->getJson('/api/v1/notifications')
            ->assertJsonPath('meta.unread_count', 0);
    }

    public function test_the_unread_filter_hides_what_was_read(): void
    {
        $client = $this->notifiedClient();
        $client->notifications()->first()->markAsRead();

        $this->actingAs($client, 'sanctum')
            ->getJson('/api/v1/notifications?unread=1')
            ->assertOk()
            ->assertJsonCount(0, 'data');
    }

    public function test_everything_can_be_marked_read_at_once(): void
    {
        $client = $this->notifiedClient();

        $this->actingAs($client, 'sanctum')
            ->postJson('/api/v1/notifications/read-all')
            ->assertNoContent();

        $this->assertSame(0, $client->unreadNotifications()->count());
    }

    public function test_a_user_only_sees_their_own_notifications(): void
    {
        $this->notifiedClient();
        $stranger = User::factory()->create();

        $this->actingAs($stranger, 'sanctum')
            ->getJson('/api/v1/notifications')
            ->assertOk()
            ->assertJsonCount(0, 'data');
    }

    public function test_a_user_cannot_mark_someone_elses_notification_as_read(): void
    {
        $client = $this->notifiedClient();
        $id = $client->notifications()->first()->id;

        // Scoped to the caller's own stream: a foreign id is a 404, not a
        // silent success that would leak the id's existence.
        $this->actingAs(User::factory()->create(), 'sanctum')
            ->postJson("/api/v1/notifications/{$id}/read")
            ->assertStatus(404);

        $this->assertSame(1, $client->unreadNotifications()->count());
    }

    public function test_a_guest_has_no_notification_stream(): void
    {
        $this->getJson('/api/v1/notifications')->assertStatus(401);
    }
}
