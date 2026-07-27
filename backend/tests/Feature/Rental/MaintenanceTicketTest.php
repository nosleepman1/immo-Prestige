<?php

namespace Tests\Feature\Rental;

use App\Enums\LeaseStatus;
use App\Enums\MaintenanceStatus;
use App\Models\Agency;
use App\Models\Lease;
use App\Models\MaintenanceTicket;
use App\Models\Property;
use App\Models\User;
use App\Notifications\MaintenanceMessagePosted;
use App\Notifications\MaintenanceTicketOpened;
use App\Notifications\MaintenanceTicketUpdated;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class MaintenanceTicketTest extends TestCase
{
    use RefreshDatabase;

    /** @return array{0: User, 1: User, 2: Lease} */
    private function activeLease(): array
    {
        $agencyUser = User::factory()->agency()->create();
        $agency = Agency::factory()->create(['user_id' => $agencyUser->id]);
        $property = Property::factory()->published()->forRent()->create(['agency_id' => $agency->id]);
        $tenant = User::factory()->create();

        $lease = Lease::factory()->status(LeaseStatus::Active)->create([
            'property_id' => $property->id,
            'agency_id' => $agency->id,
            'tenant_user_id' => $tenant->id,
        ]);

        return [$agencyUser, $tenant, $lease];
    }

    /** @param array<string, mixed> $overrides */
    private function payload(array $overrides = []): array
    {
        return array_merge([
            'title' => 'Fuite sous l\'évier',
            'description' => 'De l\'eau coule dès que j\'ouvre le robinet de la cuisine.',
            'category' => 'plumbing',
            'priority' => 'high',
        ], $overrides);
    }

    public function test_the_tenant_opens_a_ticket(): void
    {
        Notification::fake();
        [$agencyUser, $tenant, $lease] = $this->activeLease();

        $this->actingAs($tenant, 'sanctum')
            ->postJson("/api/v1/leases/{$lease->id}/tickets", $this->payload())
            ->assertCreated()
            ->assertJsonPath('data.status', 'open')
            ->assertJsonPath('data.category_label', 'Plomberie')
            ->assertJsonPath('data.priority_label', 'Haute');

        $this->assertDatabaseHas('maintenance_tickets', [
            'lease_id' => $lease->id,
            // Denormalised so the agency queue can group by building.
            'property_id' => $lease->property_id,
            'reported_by_user_id' => $tenant->id,
        ]);

        // The agency reads its work list; a mail per leak would train them to
        // ignore the channel that also carries money.
        Notification::assertSentTo($agencyUser, MaintenanceTicketOpened::class,
            function (MaintenanceTicketOpened $notification) use ($agencyUser) {
                return ! in_array('mail', $notification->via($agencyUser), true);
            });
    }

    public function test_only_the_tenant_of_the_lease_opens_a_ticket(): void
    {
        [, , $lease] = $this->activeLease();

        // RG-L21.
        $this->actingAs(User::factory()->create(), 'sanctum')
            ->postJson("/api/v1/leases/{$lease->id}/tickets", $this->payload())
            ->assertStatus(403);
    }

    public function test_the_agency_cannot_open_a_ticket_in_the_tenants_place(): void
    {
        [$agencyUser, , $lease] = $this->activeLease();

        $this->actingAs($agencyUser, 'sanctum')
            ->postJson("/api/v1/leases/{$lease->id}/tickets", $this->payload())
            ->assertStatus(403);
    }

    public function test_a_guest_cannot_open_a_ticket(): void
    {
        [, , $lease] = $this->activeLease();

        $this->postJson("/api/v1/leases/{$lease->id}/tickets", $this->payload())->assertStatus(401);
    }

    public function test_opening_validates_the_payload(): void
    {
        [, $tenant, $lease] = $this->activeLease();

        $this->actingAs($tenant, 'sanctum')
            ->postJson("/api/v1/leases/{$lease->id}/tickets", $this->payload([
                'title' => '',
                'category' => 'teleportation',
            ]))
            ->assertStatus(422)
            ->assertJsonValidationErrors(['title', 'category']);
    }

    public function test_both_parties_discuss_on_the_tickets_own_thread(): void
    {
        Notification::fake();
        [$agencyUser, $tenant, $lease] = $this->activeLease();
        $ticket = MaintenanceTicket::factory()->create([
            'lease_id' => $lease->id,
            'property_id' => $lease->property_id,
            'reported_by_user_id' => $tenant->id,
        ]);

        $this->actingAs($tenant, 'sanctum')
            ->postJson("/api/v1/tickets/{$ticket->id}/messages", ['body' => 'Le problème empire.'])
            ->assertCreated()
            ->assertJsonPath('data.is_mine', true);

        // Whoever did not write it gets told.
        Notification::assertSentTo($agencyUser, MaintenanceMessagePosted::class);
        Notification::assertNotSentTo($tenant, MaintenanceMessagePosted::class);

        $this->actingAs($agencyUser, 'sanctum')
            ->postJson("/api/v1/tickets/{$ticket->id}/messages", ['body' => 'Un plombier passe demain.'])
            ->assertCreated();

        Notification::assertSentTo($tenant, MaintenanceMessagePosted::class);
    }

    public function test_a_stranger_cannot_read_or_comment_a_ticket(): void
    {
        [, $tenant, $lease] = $this->activeLease();
        $ticket = MaintenanceTicket::factory()->create([
            'lease_id' => $lease->id,
            'property_id' => $lease->property_id,
            'reported_by_user_id' => $tenant->id,
        ]);
        $stranger = User::factory()->create();

        $this->actingAs($stranger, 'sanctum')->getJson("/api/v1/tickets/{$ticket->id}")->assertStatus(403);
        $this->actingAs($stranger, 'sanctum')
            ->postJson("/api/v1/tickets/{$ticket->id}/messages", ['body' => 'Bonjour'])
            ->assertStatus(403);
    }

    public function test_the_agency_moves_the_ticket_along(): void
    {
        Notification::fake();
        [$agencyUser, $tenant, $lease] = $this->activeLease();
        $ticket = MaintenanceTicket::factory()->create([
            'lease_id' => $lease->id,
            'property_id' => $lease->property_id,
            'reported_by_user_id' => $tenant->id,
        ]);

        $this->actingAs($agencyUser, 'sanctum')
            ->patchJson("/api/v1/agency/tickets/{$ticket->id}/status", ['status' => 'in_progress'])
            ->assertOk()
            ->assertJsonPath('data.status', 'in_progress');

        Notification::assertSentTo($tenant, MaintenanceTicketUpdated::class);
    }

    public function test_resolving_requires_saying_what_was_done(): void
    {
        [$agencyUser, $tenant, $lease] = $this->activeLease();
        $ticket = MaintenanceTicket::factory()->create([
            'lease_id' => $lease->id,
            'property_id' => $lease->property_id,
            'reported_by_user_id' => $tenant->id,
        ]);

        // "Résolu" on its own tells the tenant nothing.
        $this->actingAs($agencyUser, 'sanctum')
            ->patchJson("/api/v1/agency/tickets/{$ticket->id}/status", ['status' => 'resolved'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['resolution_note']);

        $this->actingAs($agencyUser, 'sanctum')
            ->patchJson("/api/v1/agency/tickets/{$ticket->id}/status", [
                'status' => 'resolved',
                'resolution_note' => 'Joint du siphon remplacé le 12/08.',
            ])
            ->assertOk();

        $this->assertNotNull($ticket->fresh()->resolved_at);
    }

    public function test_the_tenant_cannot_change_the_status(): void
    {
        [, $tenant, $lease] = $this->activeLease();
        $ticket = MaintenanceTicket::factory()->create([
            'lease_id' => $lease->id,
            'property_id' => $lease->property_id,
            'reported_by_user_id' => $tenant->id,
        ]);

        // Only the agency can act on the problem, so only the agency rules on it.
        $this->actingAs($tenant, 'sanctum')
            ->patchJson("/api/v1/agency/tickets/{$ticket->id}/status", ['status' => 'resolved'])
            ->assertStatus(403);
    }

    public function test_a_closed_ticket_accepts_nothing_more(): void
    {
        [$agencyUser, $tenant, $lease] = $this->activeLease();
        $ticket = MaintenanceTicket::factory()->status(MaintenanceStatus::Closed)->create([
            'lease_id' => $lease->id,
            'property_id' => $lease->property_id,
            'reported_by_user_id' => $tenant->id,
        ]);

        $this->actingAs($tenant, 'sanctum')
            ->postJson("/api/v1/tickets/{$ticket->id}/messages", ['body' => 'Ça recommence.'])
            ->assertStatus(409);

        $this->actingAs($agencyUser, 'sanctum')
            ->patchJson("/api/v1/agency/tickets/{$ticket->id}/status", ['status' => 'in_progress'])
            ->assertStatus(409);
    }

    public function test_a_photo_documents_the_problem(): void
    {
        Storage::fake('public');
        [, $tenant, $lease] = $this->activeLease();
        $ticket = MaintenanceTicket::factory()->create([
            'lease_id' => $lease->id,
            'property_id' => $lease->property_id,
            'reported_by_user_id' => $tenant->id,
        ]);

        $this->actingAs($tenant, 'sanctum')
            ->postJson("/api/v1/tickets/{$ticket->id}/images", [
                'image' => UploadedFile::fake()->image('fuite.jpg'),
            ])
            ->assertCreated();

        $this->assertDatabaseCount('maintenance_ticket_images', 1);
        Storage::disk('public')->assertExists($ticket->images()->first()->image_path);
    }

    public function test_the_agency_queue_shows_only_its_own_tickets(): void
    {
        [$agencyUser, $tenant, $lease] = $this->activeLease();
        MaintenanceTicket::factory()->count(2)->create([
            'lease_id' => $lease->id,
            'property_id' => $lease->property_id,
            'reported_by_user_id' => $tenant->id,
        ]);

        // Another agency's ticket must not appear.
        [, $otherTenant, $otherLease] = $this->activeLease();
        MaintenanceTicket::factory()->create([
            'lease_id' => $otherLease->id,
            'property_id' => $otherLease->property_id,
            'reported_by_user_id' => $otherTenant->id,
        ]);

        $this->actingAs($agencyUser, 'sanctum')
            ->getJson('/api/v1/agency/tickets')
            ->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_the_queue_puts_the_urgent_first(): void
    {
        [$agencyUser, $tenant, $lease] = $this->activeLease();

        MaintenanceTicket::factory()->create([
            'lease_id' => $lease->id, 'property_id' => $lease->property_id,
            'reported_by_user_id' => $tenant->id, 'title' => 'Normale',
        ]);
        MaintenanceTicket::factory()->urgent()->create([
            'lease_id' => $lease->id, 'property_id' => $lease->property_id,
            'reported_by_user_id' => $tenant->id, 'title' => 'Urgente',
        ]);

        // Urgent first, then oldest: the ticket that is both is the one that
        // turns into a complaint.
        $this->actingAs($agencyUser, 'sanctum')
            ->getJson('/api/v1/agency/tickets')
            ->assertOk()
            ->assertJsonPath('data.0.title', 'Urgente');
    }

    public function test_the_tenant_lists_the_tickets_of_their_lease(): void
    {
        [, $tenant, $lease] = $this->activeLease();
        MaintenanceTicket::factory()->count(3)->create([
            'lease_id' => $lease->id,
            'property_id' => $lease->property_id,
            'reported_by_user_id' => $tenant->id,
        ]);

        $this->actingAs($tenant, 'sanctum')
            ->getJson("/api/v1/leases/{$lease->id}/tickets")
            ->assertOk()
            ->assertJsonCount(3, 'data');
    }
}
