<?php

namespace Tests\Feature\Rental;

use App\Enums\InstallmentStatus;
use App\Enums\LeaseStatus;
use App\Enums\PropertyAvailability;
use App\Models\Agency;
use App\Models\Lease;
use App\Models\LeaseInstallment;
use App\Models\MaintenanceTicket;
use App\Models\Property;
use App\Models\RentalApplication;
use App\Models\User;
use App\Notifications\LeaseEnded;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class RentalDashboardTest extends TestCase
{
    use RefreshDatabase;

    /** @return array{0: User, 1: Agency} */
    private function agency(): array
    {
        $user = User::factory()->agency()->create();

        return [$user, Agency::factory()->create(['user_id' => $user->id])];
    }

    private function activeLease(Agency $agency): Lease
    {
        $property = Property::factory()->published()->forRent()
            ->create(['agency_id' => $agency->id, 'availability' => PropertyAvailability::Rented]);

        return Lease::factory()->status(LeaseStatus::Active)->create([
            'property_id' => $property->id,
            'agency_id' => $agency->id,
        ]);
    }

    public function test_the_dashboard_totals_what_is_still_owed(): void
    {
        [$user, $agency] = $this->agency();
        $lease = $this->activeLease($agency);

        // Distinct months: the factory draws a random one, and (lease, period)
        // is unique — two draws can collide and the test would pass by luck.
        LeaseInstallment::factory()->forPeriod(today()->startOfMonth()->toDateString())->create([
            'lease_id' => $lease->id, 'total_amount' => 160_000, 'paid_amount' => 0,
        ]);
        LeaseInstallment::factory()->forPeriod(today()->startOfMonth()->addMonth()->toDateString())->create([
            'lease_id' => $lease->id, 'total_amount' => 160_000, 'paid_amount' => 60_000,
            'status' => InstallmentStatus::PartiallyPaid,
        ]);
        LeaseInstallment::factory()->settled()
            ->forPeriod(today()->startOfMonth()->addMonths(2)->toDateString())
            ->create(['lease_id' => $lease->id]);

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/agency/dashboard/rental')
            ->assertOk()
            // 160 000 + (160 000 - 60 000): a settled month owes nothing.
            ->assertJsonPath('data.installments.outstanding_amount', 260_000)
            ->assertJsonPath('data.installments.outstanding_count', 2);
    }

    public function test_the_dashboard_separates_late_from_merely_owed(): void
    {
        [$user, $agency] = $this->agency();
        $lease = $this->activeLease($agency);

        LeaseInstallment::factory()->overdue()
            ->forPeriod(today()->startOfMonth()->subMonth()->toDateString())
            ->create(['lease_id' => $lease->id, 'total_amount' => 160_000, 'paid_amount' => 0]);
        LeaseInstallment::factory()
            ->forPeriod(today()->startOfMonth()->toDateString())
            ->create(['lease_id' => $lease->id, 'total_amount' => 160_000, 'paid_amount' => 0]);

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/agency/dashboard/rental')
            ->assertOk()
            ->assertJsonPath('data.installments.late_amount', 160_000)
            ->assertJsonPath('data.installments.late_count', 1)
            ->assertJsonPath('data.installments.outstanding_count', 2);
    }

    public function test_occupancy_counts_only_the_rental_stock(): void
    {
        [$user, $agency] = $this->agency();

        Property::factory()->forRent()->count(3)
            ->create(['agency_id' => $agency->id, 'availability' => PropertyAvailability::Rented]);
        Property::factory()->forRent()->create(['agency_id' => $agency->id]);
        // A sale-only listing is not vacant stock: counting it would make every
        // agency look half-empty.
        Property::factory()->forSale()->count(5)->create(['agency_id' => $agency->id]);

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/agency/dashboard/rental')
            ->assertOk()
            ->assertJsonPath('data.occupancy.total', 4)
            ->assertJsonPath('data.occupancy.rented', 3)
            ->assertJsonPath('data.occupancy.available', 1)
            ->assertJsonPath('data.occupancy.rate', 75);
    }

    public function test_the_dashboard_counts_the_work_waiting(): void
    {
        [$user, $agency] = $this->agency();
        $lease = $this->activeLease($agency);

        RentalApplication::factory()->count(2)->create([
            'agency_id' => $agency->id, 'property_id' => $lease->property_id,
        ]);
        MaintenanceTicket::factory()->urgent()->create([
            'lease_id' => $lease->id, 'property_id' => $lease->property_id,
        ]);
        MaintenanceTicket::factory()->create([
            'lease_id' => $lease->id, 'property_id' => $lease->property_id,
        ]);

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/agency/dashboard/rental')
            ->assertOk()
            ->assertJsonPath('data.applications.awaiting_review', 2)
            ->assertJsonPath('data.tickets.open', 2)
            ->assertJsonPath('data.tickets.urgent', 1)
            ->assertJsonPath('data.leases.active', 1);
    }

    public function test_an_empty_agency_reads_zero_everywhere(): void
    {
        [$user] = $this->agency();

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/agency/dashboard/rental')
            ->assertOk()
            ->assertJsonPath('data.installments.outstanding_amount', 0)
            // No division by zero on an agency with no rental stock.
            ->assertJsonPath('data.occupancy.rate', 0);
    }

    public function test_one_agency_never_sees_anothers_figures(): void
    {
        [$user] = $this->agency();
        [, $otherAgency] = $this->agency();
        $otherLease = $this->activeLease($otherAgency);
        LeaseInstallment::factory()->create(['lease_id' => $otherLease->id, 'total_amount' => 500_000]);

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/agency/dashboard/rental')
            ->assertOk()
            ->assertJsonPath('data.installments.outstanding_amount', 0)
            ->assertJsonPath('data.leases.active', 0);
    }

    public function test_a_client_has_no_agency_dashboard(): void
    {
        $this->actingAs(User::factory()->create(), 'sanctum')
            ->getJson('/api/v1/agency/dashboard/rental')
            ->assertStatus(403);
    }

    public function test_a_guest_has_no_agency_dashboard(): void
    {
        $this->getJson('/api/v1/agency/dashboard/rental')->assertStatus(401);
    }

    public function test_an_ended_lease_puts_the_property_back_on_the_market(): void
    {
        Notification::fake();
        [$agencyUser, $agency] = $this->agency();
        $lease = $this->activeLease($agency);
        $lease->update(['end_date' => today()->subDay()->toDateString()]);

        Artisan::call('rentals:expire-leases');

        // RG-L23.
        $this->assertSame(LeaseStatus::Expired, $lease->fresh()->status);
        $this->assertSame(PropertyAvailability::Available, $lease->property->fresh()->availability);
        Notification::assertSentTo($lease->tenant, LeaseEnded::class);
        Notification::assertSentTo($agencyUser, LeaseEnded::class);
    }

    public function test_a_running_lease_is_left_alone(): void
    {
        Notification::fake();
        [, $agency] = $this->agency();
        $lease = $this->activeLease($agency);
        $lease->update(['end_date' => today()->addYear()->toDateString()]);

        Artisan::call('rentals:expire-leases');

        $this->assertSame(LeaseStatus::Active, $lease->fresh()->status);
        $this->assertSame(PropertyAvailability::Rented, $lease->property->fresh()->availability);
        Notification::assertNothingSent();
    }

    public function test_a_property_already_re_let_is_not_pulled_back(): void
    {
        Notification::fake();
        [, $agency] = $this->agency();
        $lease = $this->activeLease($agency);
        $lease->update(['end_date' => today()->subDay()->toDateString()]);
        // The agency reserved it for the next tenant before the sweep ran.
        $lease->property->update(['availability' => PropertyAvailability::Reserved]);

        Artisan::call('rentals:expire-leases');

        $this->assertSame(LeaseStatus::Expired, $lease->fresh()->status);
        $this->assertSame(PropertyAvailability::Reserved, $lease->property->fresh()->availability);
    }
}
