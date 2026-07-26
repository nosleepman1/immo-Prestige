<?php

namespace App\Actions\Rental;

use App\Models\Payment;
use App\Notifications\PaymentReceived;
use Illuminate\Support\Facades\DB;

/**
 * Tells both sides that money changed hands.
 *
 * Extracted as its own action because three paths reach it — the online
 * confirmation, the cash receipt, and the move-in payment — and "who gets told
 * when a payment lands" is one rule, not three.
 */
class NotifyPaymentReceived
{
    public function handle(Payment $payment): void
    {
        $payment->loadMissing(['lease', 'payer']);

        DB::afterCommit(function () use ($payment) {
            $payment->payer?->notify(new PaymentReceived($payment));

            $agencyUser = $payment->agency()->with('user')->first()?->user;
            $agencyUser?->notify(new PaymentReceived($payment));
        });
    }
}
