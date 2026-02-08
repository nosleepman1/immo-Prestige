<?php

namespace Tests\Feature\Rental;

use App\Actions\Rental\ApplyPaymentToInstallments;
use App\Enums\InstallmentStatus;
use App\Enums\PaymentPurpose;
use App\Enums\PaymentStatus;
use App\Exceptions\ExcessiveImputationException;
use App\Models\Lease;
use App\Models\LeaseInstallment;
use App\Models\Payment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Imputation is the piece that makes "pay three months at once" work, and the
 * one place where a mistake silently corrupts a ledger. Tested directly rather
 * than through HTTP: it branches in many directions for a single rule.
 */
class ImputationTest extends TestCase
{
    use RefreshDatabase;

    private ApplyPaymentToInstallments $apply;

    protected function setUp(): void
    {
        parent::setUp();
        $this->apply = app(ApplyPaymentToInstallments::class);
    }

    /** @return array{0: Lease, 1: \Illuminate\Support\Collection<int, LeaseInstallment>} */
    private function leaseWithMonths(int $count = 3, int $total = 160_000): array
    {
        $lease = Lease::factory()->create(['rent_amount' => 150_000, 'charges_amount' => 10_000]);

        $months = collect(range(0, $count - 1))->map(fn ($i) => LeaseInstallment::factory()
            ->forPeriod(now()->startOfMonth()->addMonths($i)->toDateString())
            ->create([
                'lease_id' => $lease->id,
                'rent_amount' => 150_000,
                'charges_amount' => 10_000,
                'total_amount' => $total,
            ]));

        return [$lease, $months];
    }

    private function payment(Lease $lease, int $amount): Payment
    {
        return Payment::create([
            'agency_id' => $lease->agency_id,
            'lease_id' => $lease->id,
            'payer_user_id' => $lease->tenant_user_id,
            'purpose' => PaymentPurpose::Rent,
            'amount' => $amount,
            'status' => PaymentStatus::Paid,
        ]);
    }

    public function test_one_payment_settles_three_months_at_once(): void
    {
        [$lease, $months] = $this->leaseWithMonths(3);
        $payment = $this->payment($lease, 480_000);

        $this->apply->handle($payment, $months);

        foreach ($months as $month) {
            $this->assertSame(InstallmentStatus::Paid, $month->fresh()->status);
            $this->assertSame(160_000, $month->fresh()->paid_amount);
        }
    }

    public function test_each_share_is_recorded_line_by_line(): void
    {
        [$lease, $months] = $this->leaseWithMonths(3);
        $payment = $this->payment($lease, 480_000);

        $this->apply->handle($payment, $months);

        // Knowing *that* a payment touched a month is useless without knowing
        // how much went there: the receipt quotes this figure.
        $this->assertDatabaseCount('installment_payment', 3);
        foreach ($months as $month) {
            $this->assertDatabaseHas('installment_payment', [
                'payment_id' => $payment->id,
                'lease_installment_id' => $month->id,
                'applied_amount' => 160_000,
            ]);
        }
    }

    public function test_a_partial_payment_leaves_the_month_partially_paid(): void
    {
        [$lease, $months] = $this->leaseWithMonths(1);
        $payment = $this->payment($lease, 60_000);

        $this->apply->handle($payment, $months);

        $month = $months->first()->fresh();
        $this->assertSame(InstallmentStatus::PartiallyPaid, $month->status);
        $this->assertSame(60_000, $month->paid_amount);
        $this->assertSame(100_000, $month->remainingDue());
    }

    public function test_a_second_payment_completes_the_month(): void
    {
        [$lease, $months] = $this->leaseWithMonths(1);

        $this->apply->handle($this->payment($lease, 60_000), $months);
        $this->apply->handle($this->payment($lease, 100_000), $months->map->fresh());

        $month = $months->first()->fresh();
        $this->assertSame(InstallmentStatus::Paid, $month->status);
        $this->assertSame(160_000, $month->paid_amount);
        $this->assertNotNull($month->paid_at);
    }

    public function test_the_oldest_month_is_cleared_first(): void
    {
        [$lease, $months] = $this->leaseWithMonths(3);
        // Enough for one month and a half.
        $payment = $this->payment($lease, 240_000);

        $this->apply->handle($payment, $months);

        // A tenant paying a round sum expects it to clear their oldest debt,
        // not to sit against a month that is not due yet.
        $this->assertSame(160_000, $months[0]->fresh()->paid_amount);
        $this->assertSame(80_000, $months[1]->fresh()->paid_amount);
        $this->assertSame(0, $months[2]->fresh()->paid_amount);
    }

    public function test_an_imputation_beyond_what_is_owed_is_refused(): void
    {
        [$lease, $months] = $this->leaseWithMonths(1);
        $payment = $this->payment($lease, 500_000);

        // RG-L20: overpaying makes the ledger lie, and the excess has no month
        // to belong to.
        $this->expectException(ExcessiveImputationException::class);

        $this->apply->handle($payment, $months);
    }

    public function test_nothing_is_written_when_the_imputation_is_refused(): void
    {
        [$lease, $months] = $this->leaseWithMonths(3);
        $payment = $this->payment($lease, 500_000);

        try {
            $this->apply->handle($payment, $months);
        } catch (ExcessiveImputationException) {
            // Checked against the whole selection up front: spreading first and
            // discovering the excess on the last line would leave a
            // half-imputed payment behind.
        }

        $this->assertDatabaseCount('installment_payment', 0);
        $this->assertSame(0, $months[0]->fresh()->paid_amount);
    }

    public function test_a_settled_month_never_goes_negative(): void
    {
        [$lease, $months] = $this->leaseWithMonths(2);
        $this->apply->handle($this->payment($lease, 320_000), $months);

        $refreshed = $months->map->fresh();
        foreach ($refreshed as $month) {
            $this->assertSame(0, $month->remainingDue());
            $this->assertGreaterThanOrEqual(0, $month->total_amount - $month->paid_amount);
        }
    }

    public function test_an_already_settled_month_is_skipped(): void
    {
        [$lease, $months] = $this->leaseWithMonths(2);
        $this->apply->handle($this->payment($lease, 160_000), collect([$months[0]]));

        // The second payment targets both, but the first has nothing left owed.
        $this->apply->handle($this->payment($lease, 160_000), $months->map->fresh());

        $this->assertSame(160_000, $months[0]->fresh()->paid_amount);
        $this->assertSame(160_000, $months[1]->fresh()->paid_amount);
    }

    public function test_the_payment_tracks_what_is_still_unimputed(): void
    {
        [$lease, $months] = $this->leaseWithMonths(2);
        $payment = $this->payment($lease, 320_000);

        $this->apply->handle($payment, $months, 160_000);

        // A move-in payment behaves this way: its deposit share is held rather
        // than earned, so it is never imputed onto a month.
        $this->assertSame(160_000, $payment->fresh()->appliedAmount());
        $this->assertSame(160_000, $payment->fresh()->unappliedAmount());
    }
}
