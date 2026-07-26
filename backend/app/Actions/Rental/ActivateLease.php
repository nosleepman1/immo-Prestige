<?php

namespace App\Actions\Rental;

use App\Enums\LeaseStatus;
use App\Enums\PropertyAvailability;
use App\Models\Lease;
use App\Models\Payment;
use App\Notifications\LeaseActivated;
use Illuminate\Support\Facades\DB;

/**
 * Turns a paid move-in payment into a running lease.
 *
 * RG-L14: the lease only becomes active once the initial payment is confirmed —
 * not when the tenant clicks pay, not when the invoice is created. RG-L15: the
 * property then reads `rented`, which is what takes it out of every search.
 *
 * Idempotent: a duplicate webhook must not re-activate a lease nor generate a
 * second set of instalments.
 */
class ActivateLease
{
    public function __construct(
        private readonly GenerateInstallments $generate,
        private readonly ApplyPaymentToInstallments $apply,
    ) {}

    public function handle(Lease $lease, Payment $payment): Lease
    {
        if ($lease->status === LeaseStatus::Active) {
            return $lease;
        }

        DB::transaction(function () use ($lease, $payment) {
            $lease->update(['status' => LeaseStatus::Active]);

            // RG-L15.
            $lease->property()->update(['availability' => PropertyAvailability::Rented]);

            $installments = $this->generate->handle($lease);

            // The advance months are already paid; the deposit is not imputed
            // onto any month, because it is held rather than earned.
            $advance = $lease->monthlyTotal() * $lease->advance_months;

            if ($advance > 0 && $installments->isNotEmpty()) {
                $this->apply->handle($payment, $installments, $advance);
            }
        });

        DB::afterCommit(function () use ($lease) {
            $lease->tenant?->notify(new LeaseActivated($lease->load(['property', 'agency'])));

            $agencyUser = $lease->agency()->with('user')->first()?->user;
            $agencyUser?->notify(new LeaseActivated($lease));
        });

        return $lease->refresh();
    }
}
