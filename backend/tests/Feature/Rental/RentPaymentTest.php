<?php

namespace Tests\Feature\Rental;

use App\Actions\Subscription\ProcessPaymentIpn;
use App\Enums\InstallmentStatus;
use App\Enums\LeaseStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Enums\PropertyAvailability;
use App\Models\Agency;
use App\Models\Lease;
use App\Models\LeaseInstallment;
use App\Models\Payment;
use App\Models\Property;
use App\Models\User;
use App\Notifications\LeaseActivated;
use App\Notifications\PaymentReceived;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class RentPaymentTest extends TestCase
{
    use RefreshDatabase;

    /** @return array{0: User, 1: User, 2: Lease} */
    private function lease(LeaseStatus $status = LeaseStatus::PendingPayment): array
    {
        $agencyUser = User::factory()->agency()->create();
        $agency = Agency::factory()->create(['user_id' => $agencyUser->id]);
        $property = Property::factory()->published()->forRent()->create(['agency_id' => $agency->id]);
        $tenant = User::factory()->create();

        $lease = Lease::factory()->status($status)->create([
            'property_id' => $property->id,
            'agency_id' => $agency->id,
            'tenant_user_id' => $tenant->id,
            'rent_amount' => 150_000,
            'charges_amount' => 10_000,
            'deposit_amount' => 300_000,
            'advance_months' => 2,
            'start_date' => today()->startOfMonth()->toDateString(),
            'end_date' => today()->startOfMonth()->addMonths(12)->subDay()->toDateString(),
            'duration_months' => 12,
        ]);

        return [$agencyUser, $tenant, $lease];
    }

    /**
     * Drives the whole confirmation path rather than calling the activation
     * directly: the fake gateway confirms, so this exercises signature check,
     * re-confirmation and imputation together.
     */
    private function confirm(Payment $payment): void
    {
        app(ProcessPaymentIpn::class)->handle([
            'invoice' => ['token' => $payment->invoice_token],
            'status' => 'completed',
            'signature_valid' => true,
        ]);
    }

    public function test_the_tenant_opens_the_move_in_payment(): void
    {
        [, $tenant, $lease] = $this->lease();

        $this->actingAs($tenant, 'sanctum')
            ->postJson("/api/v1/leases/{$lease->id}/initial-payment/checkout")
            ->assertCreated()
            // RG-L13: deposit + 2 x (150 000 + 10 000).
            ->assertJsonPath('amount', 620_000)
            ->assertJsonStructure(['redirect_url']);

        // Nothing advances at checkout: only the confirmation moves the lease.
        $this->assertSame(LeaseStatus::PendingPayment, $lease->fresh()->status);
    }

    public function test_a_lease_not_awaiting_payment_cannot_be_paid(): void
    {
        [, $tenant, $lease] = $this->lease(LeaseStatus::PendingSignature);

        $this->actingAs($tenant, 'sanctum')
            ->postJson("/api/v1/leases/{$lease->id}/initial-payment/checkout")
            ->assertStatus(409);
    }

    public function test_the_confirmed_move_in_payment_activates_the_lease(): void
    {
        Notification::fake();
        [, $tenant, $lease] = $this->lease();

        $this->actingAs($tenant, 'sanctum')
            ->postJson("/api/v1/leases/{$lease->id}/initial-payment/checkout")->assertCreated();

        $this->confirm(Payment::first());

        // RG-L14.
        $this->assertSame(LeaseStatus::Active, $lease->fresh()->status);
        // RG-L15: the property leaves every search.
        $this->assertSame(PropertyAvailability::Rented, $lease->property->fresh()->availability);
        Notification::assertSentTo($tenant, LeaseActivated::class);
    }

    public function test_activation_generates_the_schedule_and_credits_the_advance(): void
    {
        Notification::fake();
        [, $tenant, $lease] = $this->lease();

        $this->actingAs($tenant, 'sanctum')
            ->postJson("/api/v1/leases/{$lease->id}/initial-payment/checkout")->assertCreated();
        $this->confirm(Payment::first());

        $installments = $lease->installments()->orderBy('due_date')->get();
        $this->assertGreaterThanOrEqual(2, $installments->count());

        // The two advance months are already settled; the deposit is not
        // imputed onto any month, because it is held rather than earned.
        $this->assertSame(InstallmentStatus::Paid, $installments[0]->status);
        $this->assertSame(InstallmentStatus::Paid, $installments[1]->status);
        $this->assertSame(300_000, Payment::first()->unappliedAmount());
    }

    public function test_a_duplicate_webhook_does_not_activate_twice(): void
    {
        Notification::fake();
        [, $tenant, $lease] = $this->lease();

        $this->actingAs($tenant, 'sanctum')
            ->postJson("/api/v1/leases/{$lease->id}/initial-payment/checkout")->assertCreated();
        $payment = Payment::first();

        $this->confirm($payment);
        $countAfterFirst = $lease->installments()->count();
        $this->confirm($payment->fresh());

        $this->assertSame($countAfterFirst, $lease->fresh()->installments()->count());
        $this->assertSame(1, Payment::count());
    }

    public function test_the_tenant_settles_three_months_in_one_payment(): void
    {
        Notification::fake();
        [, $tenant, $lease] = $this->lease(LeaseStatus::Active);

        $months = collect(range(0, 2))->map(fn ($i) => LeaseInstallment::factory()
            ->forPeriod(today()->startOfMonth()->addMonths($i)->toDateString())
            ->create(['lease_id' => $lease->id]));

        $this->actingAs($tenant, 'sanctum')
            ->postJson("/api/v1/leases/{$lease->id}/installments/checkout", [
                'installment_ids' => $months->pluck('id')->all(),
            ])
            ->assertCreated()
            // Recomputed from what the months owe, never taken from the client.
            ->assertJsonPath('amount', 480_000);

        $this->confirm(Payment::first());

        foreach ($months as $month) {
            $this->assertSame(InstallmentStatus::Paid, $month->fresh()->status);
        }
    }

    public function test_the_amount_is_never_taken_from_the_request(): void
    {
        [, $tenant, $lease] = $this->lease(LeaseStatus::Active);
        $month = LeaseInstallment::factory()->create(['lease_id' => $lease->id]);

        $this->actingAs($tenant, 'sanctum')
            ->postJson("/api/v1/leases/{$lease->id}/installments/checkout", [
                'installment_ids' => [$month->id],
                // A figure supplied by a browser is a figure someone can change.
                'amount' => 1,
            ])
            ->assertCreated()
            ->assertJsonPath('amount', 160_000);
    }

    public function test_an_already_settled_month_cannot_be_paid_again(): void
    {
        [, $tenant, $lease] = $this->lease(LeaseStatus::Active);
        $month = LeaseInstallment::factory()->settled()->create(['lease_id' => $lease->id]);

        $this->actingAs($tenant, 'sanctum')
            ->postJson("/api/v1/leases/{$lease->id}/installments/checkout", [
                'installment_ids' => [$month->id],
            ])
            ->assertStatus(422);
    }

    public function test_a_stranger_cannot_pay_someone_elses_lease(): void
    {
        [, , $lease] = $this->lease(LeaseStatus::Active);
        $month = LeaseInstallment::factory()->create(['lease_id' => $lease->id]);

        $this->actingAs(User::factory()->create(), 'sanctum')
            ->postJson("/api/v1/leases/{$lease->id}/installments/checkout", [
                'installment_ids' => [$month->id],
            ])
            ->assertStatus(403);
    }

    public function test_both_parties_are_told_a_payment_landed(): void
    {
        Notification::fake();
        [$agencyUser, $tenant, $lease] = $this->lease(LeaseStatus::Active);
        $month = LeaseInstallment::factory()->create(['lease_id' => $lease->id]);

        $this->actingAs($tenant, 'sanctum')
            ->postJson("/api/v1/leases/{$lease->id}/installments/checkout", [
                'installment_ids' => [$month->id],
            ])->assertCreated();
        $this->confirm(Payment::first());

        // It engages money, so it is mailed, and it stands as proof.
        Notification::assertSentTo($tenant, PaymentReceived::class);
        Notification::assertSentTo($agencyUser, PaymentReceived::class);
    }

    public function test_the_agency_records_rent_paid_in_cash(): void
    {
        Notification::fake();
        [$agencyUser, , $lease] = $this->lease(LeaseStatus::Active);
        $month = LeaseInstallment::factory()->create(['lease_id' => $lease->id]);

        $this->actingAs($agencyUser, 'sanctum')
            ->postJson("/api/v1/agency/leases/{$lease->id}/record-cash-payment", [
                'installment_ids' => [$month->id],
                'amount' => 160_000,
            ])
            ->assertCreated();

        $payment = Payment::where('method', PaymentMethod::Cash->value)->first();
        // RG-L19: nominative and timestamped, both written at the moment.
        $this->assertSame($agencyUser->id, (int) $payment->validated_by);
        $this->assertNotNull($payment->validated_at);
        $this->assertNull($payment->provider);
        $this->assertSame(PaymentStatus::Paid, $payment->status);
        $this->assertSame(InstallmentStatus::Paid, $month->fresh()->status);
    }

    public function test_a_cash_entry_beyond_what_is_owed_is_refused(): void
    {
        [$agencyUser, , $lease] = $this->lease(LeaseStatus::Active);
        $month = LeaseInstallment::factory()->create(['lease_id' => $lease->id]);

        // A figure typed by a human is exactly where an excess comes from.
        $this->actingAs($agencyUser, 'sanctum')
            ->postJson("/api/v1/agency/leases/{$lease->id}/record-cash-payment", [
                'installment_ids' => [$month->id],
                'amount' => 500_000,
            ])
            ->assertStatus(422);

        $this->assertSame(0, $month->fresh()->paid_amount);
    }

    public function test_the_tenant_cannot_record_a_cash_payment(): void
    {
        [, $tenant, $lease] = $this->lease(LeaseStatus::Active);
        $month = LeaseInstallment::factory()->create(['lease_id' => $lease->id]);

        $this->actingAs($tenant, 'sanctum')
            ->postJson("/api/v1/agency/leases/{$lease->id}/record-cash-payment", [
                'installment_ids' => [$month->id],
                'amount' => 160_000,
            ])
            ->assertStatus(403);
    }

    public function test_a_guest_cannot_pay_anything(): void
    {
        [, , $lease] = $this->lease();

        $this->postJson("/api/v1/leases/{$lease->id}/initial-payment/checkout")->assertStatus(401);
    }
}
