<?php

namespace Tests\Feature\Rental;

use App\Actions\Rental\GenerateInstallments;
use App\Enums\InstallmentStatus;
use App\Enums\LeaseStatus;
use App\Models\Lease;
use App\Models\LeaseInstallment;
use App\Notifications\InstallmentDueSoon;
use App\Notifications\InstallmentLate;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class InstallmentScheduleTest extends TestCase
{
    use RefreshDatabase;

    private function activeLease(string $start = '2026-09-01', int $months = 12): Lease
    {
        return Lease::factory()->status(LeaseStatus::Active)->create([
            'start_date' => $start,
            'end_date' => Carbon::parse($start)->addMonths($months)->subDay()->toDateString(),
            'duration_months' => $months,
            'rent_amount' => 150_000,
            'charges_amount' => 10_000,
            'payment_day' => 5,
        ]);
    }

    public function test_instalments_are_monthly_whatever_the_periodicity(): void
    {
        // RG-L16: a quarterly payer settles three of these at once rather than
        // owing one opaque quarterly sum.
        $lease = $this->activeLease();
        $lease->update(['periodicity' => 'quarterly']);

        app(GenerateInstallments::class)->handle($lease, Carbon::parse('2026-12-31'));

        $installments = $lease->installments()->orderBy('period_start')->get();
        $this->assertSame(4, $installments->count());
        $this->assertSame('2026-09-01', $installments[0]->period_start->toDateString());
        $this->assertSame('2026-09-30', $installments[0]->period_end->toDateString());
        $this->assertSame('2026-10-01', $installments[1]->period_start->toDateString());
    }

    public function test_the_due_date_follows_the_leases_payment_day(): void
    {
        $lease = $this->activeLease();
        $lease->update(['payment_day' => 10]);

        app(GenerateInstallments::class)->handle($lease, Carbon::parse('2026-10-31'));

        $this->assertSame('2026-09-10', $lease->installments()->orderBy('period_start')->first()->due_date->toDateString());
    }

    public function test_each_instalment_carries_the_leases_frozen_amounts(): void
    {
        $lease = $this->activeLease();

        app(GenerateInstallments::class)->handle($lease, Carbon::parse('2026-10-31'));

        $first = $lease->installments()->first();
        $this->assertSame(150_000, $first->rent_amount);
        $this->assertSame(10_000, $first->charges_amount);
        $this->assertSame(160_000, $first->total_amount);
    }

    public function test_running_the_generator_twice_creates_nothing_new(): void
    {
        $lease = $this->activeLease();
        $generate = app(GenerateInstallments::class);

        $generate->handle($lease, Carbon::parse('2026-12-31'));
        $countAfterFirst = $lease->installments()->count();

        // The scheduler runs daily; safety comes from the unique index on
        // (lease, period_start), not from a check that would race with itself.
        $second = $generate->handle($lease, Carbon::parse('2026-12-31'));

        $this->assertSame(0, $second->count());
        $this->assertSame($countAfterFirst, $lease->fresh()->installments()->count());
    }

    public function test_the_schedule_never_runs_past_the_lease(): void
    {
        $lease = $this->activeLease(months: 3);

        app(GenerateInstallments::class)->handle($lease, Carbon::parse('2030-01-01'));

        $this->assertSame(3, $lease->installments()->count());
        $this->assertTrue(
            $lease->installments()->orderByDesc('period_end')->first()->period_end->lte($lease->end_date)
        );
    }

    public function test_the_command_covers_every_active_lease(): void
    {
        $this->activeLease(start: today()->startOfMonth()->toDateString());
        $this->activeLease(start: today()->startOfMonth()->toDateString());
        // A lease still waiting for payment owes nothing yet.
        Lease::factory()->status(LeaseStatus::PendingPayment)->create();

        Artisan::call('rentals:generate-installments');

        $this->assertGreaterThan(0, LeaseInstallment::count());
        $this->assertSame(
            0,
            LeaseInstallment::whereIn('lease_id', Lease::where('status', LeaseStatus::PendingPayment->value)->select('id'))->count()
        );
    }

    public function test_an_overdue_instalment_is_marked_late_and_the_tenant_told(): void
    {
        Notification::fake();
        $lease = $this->activeLease();
        $installment = LeaseInstallment::factory()->create([
            'lease_id' => $lease->id,
            'due_date' => today()->subDays(3)->toDateString(),
            'status' => InstallmentStatus::Pending,
        ]);

        Artisan::call('rentals:mark-late');

        // RG-L18.
        $this->assertSame(InstallmentStatus::Late, $installment->fresh()->status);
        Notification::assertSentTo($lease->tenant, InstallmentLate::class);
    }

    public function test_a_settled_instalment_is_never_marked_late(): void
    {
        Notification::fake();
        $lease = $this->activeLease();
        $installment = LeaseInstallment::factory()->settled()->create([
            'lease_id' => $lease->id,
            'due_date' => today()->subDays(3)->toDateString(),
        ]);

        Artisan::call('rentals:mark-late');

        $this->assertSame(InstallmentStatus::Paid, $installment->fresh()->status);
        Notification::assertNothingSent();
    }

    public function test_a_partially_paid_instalment_past_due_becomes_late(): void
    {
        Notification::fake();
        $lease = $this->activeLease();
        $installment = LeaseInstallment::factory()->create([
            'lease_id' => $lease->id,
            'due_date' => today()->subDay()->toDateString(),
            'paid_amount' => 60_000,
            'status' => InstallmentStatus::PartiallyPaid,
        ]);

        // Owing part of a month past its date is still owing it.
        Artisan::call('rentals:mark-late');

        $this->assertSame(InstallmentStatus::Late, $installment->fresh()->status);
    }

    public function test_tenants_are_warned_five_days_ahead(): void
    {
        Notification::fake();
        $lease = $this->activeLease();
        LeaseInstallment::factory()->create([
            'lease_id' => $lease->id,
            'due_date' => today()->addDays(5)->toDateString(),
            'status' => InstallmentStatus::Pending,
        ]);

        Artisan::call('rentals:notify-due-soon');

        Notification::assertSentTo($lease->tenant, InstallmentDueSoon::class);
    }

    public function test_the_warning_targets_one_day_not_a_window(): void
    {
        Notification::fake();
        $lease = $this->activeLease();
        LeaseInstallment::factory()->create([
            'lease_id' => $lease->id,
            'due_date' => today()->addDays(9)->toDateString(),
            'status' => InstallmentStatus::Pending,
        ]);

        // A daily reminder would train the tenant to ignore the channel.
        Artisan::call('rentals:notify-due-soon');

        Notification::assertNothingSent();
    }
}
