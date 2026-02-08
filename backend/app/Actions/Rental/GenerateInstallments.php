<?php

namespace App\Actions\Rental;

use App\Enums\InstallmentStatus;
use App\Models\Lease;
use App\Models\LeaseInstallment;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Creates the monthly instalments of a lease up to a horizon.
 *
 * RG-L16: always monthly, whatever the lease's payment periodicity. A quarterly
 * payer settles three of these at once rather than owing one opaque quarterly
 * sum — which is what makes a per-month receipt possible and arrears legible.
 *
 * Runs daily from the scheduler and is safe to run twice: the unique index on
 * (lease, period_start) is what guarantees it, not a check-then-insert that
 * would race with itself.
 */
class GenerateInstallments
{
    /**
     * How far ahead instalments are created. Two months is enough for a tenant
     * to pay in advance without filling the table with years of rows that a
     * termination would have to cancel.
     */
    public const HORIZON_MONTHS = 2;

    /**
     * @return Collection<int, LeaseInstallment> the instalments created by this run
     */
    public function handle(Lease $lease, ?Carbon $until = null): Collection
    {
        $horizon = $until ?? now()->addMonths(self::HORIZON_MONTHS);
        $created = collect();

        return DB::transaction(function () use ($lease, $horizon, $created) {
            $periodStart = $lease->start_date->copy();

            while ($periodStart->lte($horizon) && $periodStart->lt($lease->end_date)) {
                $periodEnd = $periodStart->copy()->addMonth()->subDay();

                // Never past the lease's own end: a final partial month is a
                // month the tenant does not owe in full.
                if ($periodEnd->gt($lease->end_date)) {
                    $periodEnd = $lease->end_date->copy();
                }

                // whereDate, not a string equality: the `date` cast stores
                // "2026-09-01 00:00:00", which never equals "2026-09-01".
                $exists = LeaseInstallment::where('lease_id', $lease->id)
                    ->whereDate('period_start', $periodStart->toDateString())
                    ->exists();

                if (! $exists) {
                    $created->push(LeaseInstallment::create([
                        'lease_id' => $lease->id,
                        'reference' => LeaseInstallment::nextReference(),
                        'period_start' => $periodStart->toDateString(),
                        'period_end' => $periodEnd->toDateString(),
                        'due_date' => $this->dueDate($periodStart, $lease->payment_day),
                        'rent_amount' => $lease->rent_amount,
                        'charges_amount' => $lease->charges_amount,
                        'total_amount' => $lease->monthlyTotal(),
                        'status' => InstallmentStatus::Pending,
                    ]));
                }

                $periodStart->addMonth();
            }

            return $created;
        });
    }

    /**
     * The payment day within the period's month. `payment_day` is capped at 28
     * upstream, so this date exists in February too.
     */
    private function dueDate(Carbon $periodStart, int $paymentDay): string
    {
        return $periodStart->copy()->day($paymentDay)->toDateString();
    }
}
