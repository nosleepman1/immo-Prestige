<?php

namespace Tests\Feature\Rental;

use App\Models\Agency;
use App\Models\Lease;
use App\Models\Property;
use App\Models\RentalApplication;
use App\Models\User;
use App\Notifications\RentalApplicationAccepted;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Notifications\Events\BroadcastNotificationCreated;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;

/**
 * The broadcast leg of the three channels: an open screen has to learn what
 * happened without the user reloading.
 */
class RealtimeNotificationTest extends TestCase
{
    use RefreshDatabase;

    private function application(User $client): RentalApplication
    {
        $agencyUser = User::factory()->agency()->create();
        $agency = Agency::factory()->create(['user_id' => $agencyUser->id]);
        $property = Property::factory()->published()->forRent()->create(['agency_id' => $agency->id]);

        return RentalApplication::factory()->create([
            'property_id' => $property->id,
            'agency_id' => $agency->id,
            'applicant_user_id' => $client->id,
        ]);
    }

    public function test_a_notification_is_broadcast_as_well_as_stored(): void
    {
        Event::fake([BroadcastNotificationCreated::class]);

        $client = User::factory()->create();
        $client->notify(new RentalApplicationAccepted($this->application($client)->load('property')));

        Event::assertDispatched(BroadcastNotificationCreated::class);
        // Stored too: the badge must survive a closed app.
        $this->assertDatabaseCount('notifications', 1);
    }

    public function test_the_broadcast_carries_the_same_payload_as_the_stored_one(): void
    {
        Event::fake([BroadcastNotificationCreated::class]);

        $client = User::factory()->create();
        $application = $this->application($client);
        $client->notify(new RentalApplicationAccepted($application->load('property')));

        Event::assertDispatched(BroadcastNotificationCreated::class,
            function (BroadcastNotificationCreated $event) use ($application) {
                // Written once in the notification, so the badge, the list and
                // the live event can never disagree.
                return $event->data['key'] === 'rental_application.accepted'
                    && $event->data['rental_application_id'] === $application->id;
            });
    }

    public function test_the_stream_is_private_to_its_owner(): void
    {
        $owner = User::factory()->create();
        $stranger = User::factory()->create();

        // Laravel's Notifiable broadcasts on App.Models.User.{id}; the callback
        // registered in channels.php is what keeps it personal.
        $this->assertTrue($this->authorises($owner, $owner->id));
        $this->assertFalse((bool) $this->authorises($stranger, $owner->id));
    }

    public function test_an_admin_does_not_get_to_listen_in(): void
    {
        $owner = User::factory()->create();
        $admin = User::factory()->admin()->create();

        // A notification is addressed, not supervised.
        $this->assertFalse((bool) $this->authorises($admin, $owner->id));
    }

    /**
     * Runs the channel authorisation callback the way Broadcast would.
     */
    private function authorises(User $user, int $channelUserId): bool
    {
        $callback = Broadcast::getChannels()['App.Models.User.{userId}'] ?? null;

        $this->assertNotNull($callback, 'the personal notification channel is not registered');

        return (bool) $callback($user, $channelUserId);
    }

    public function test_the_conversation_channel_is_still_registered(): void
    {
        // Lot 8's channel must survive the lot 11 addition beside it.
        $this->assertArrayHasKey('conversation.{conversationId}', Broadcast::getChannels());
    }

    public function test_a_lease_notification_reaches_the_tenants_stream(): void
    {
        Event::fake([BroadcastNotificationCreated::class]);

        $client = User::factory()->create();
        $application = $this->application($client);
        $lease = Lease::factory()->create([
            'property_id' => $application->property_id,
            'agency_id' => $application->agency_id,
            'tenant_user_id' => $client->id,
        ]);

        $client->notify(new \App\Notifications\LeaseActivated($lease->load('property')));

        Event::assertDispatched(BroadcastNotificationCreated::class,
            fn (BroadcastNotificationCreated $event) => $event->data['key'] === 'lease.activated'
                && $event->data['lease_reference'] === $lease->reference);
    }
}
