<?php

namespace App\Actions\Rental;

use App\Exceptions\ExcessiveImputationException;
use App\Models\LeaseInstallment;
use App\Models\Payment;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Spreads a confirmed payment over the instalments it is meant to settle.
 *
 * This is the piece that makes "pay three months at once" work (RG-L17). The
 * imputation is written line by line: knowing *that* a payment touched a month
 * is useless without knowing how much of it went there — that figure is what
 * the receipt quotes and what an arrears dispute turns on.
 *
 * Amounts are consumed oldest instalment first. A tenant who pays a round sum
 * expects it to clear their oldest debt, not to sit against a month that is not
 * due yet.
 */
class ApplyPaymentToInstallments
{
    /**
     * @param  Collection<int, LeaseInstallment>  $installments
     * @return Collection<int, LeaseInstallment> the instalments actually touched
     *
     * @throws ExcessiveImputationException
     */
    public function handle(Payment $payment, Collection $installments, ?int $amount = null): Collection
    {
        $ordered = $installments->sortBy('due_date')->values();
        $available = $amount ?? $payment->unappliedAmount();

        $totalDue = $ordered->sum(fn (LeaseInstallment $i) => $i->remainingDue());

        // RG-L20. Checked against the whole selection before writing anything:
        // spreading first and discovering the excess on the last line would
        // leave a half-imputed payment behind.
        if ($available > $totalDue) {
            throw new ExcessiveImputationException($available, (int) $totalDue);
        }

        return DB::transaction(function () use ($payment, $ordered, $available) {
            $remaining = $available;
            $touched = collect();

            foreach ($ordered as $installment) {
                if ($remaining <= 0) {
                    break;
                }

                $share = min($remaining, $installment->remainingDue());

                if ($share <= 0) {
                    continue;
                }

                // A payment may already carry a share on this month (a partial
                // settlement completed later); the two add up rather than
                // replacing one another.
                $existing = (int) ($payment->installments()
                    ->where('lease_installment_id', $installment->id)
                    ->value('installment_payment.applied_amount') ?? 0);

                $payment->installments()->syncWithoutDetaching([
                    $installment->id => ['applied_amount' => $existing + $share],
                ]);

                $installment->refreshSettlement();

                $remaining -= $share;
                $touched->push($installment->fresh());
            }

            return $touched;
        });
    }
}
