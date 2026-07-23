<?php

namespace App\Actions\Subscription;

use App\Enums\PaymentPurpose;
use App\Enums\PaymentStatus;
use App\Models\Payment;
use App\Models\Transaction;
use App\Payments\Contracts\PaymentGateway;
use Illuminate\Support\Facades\DB;

/**
 * IPN is the source of truth. Every notification is journalled; only a
 * signature-valid, not-yet-paid notification changes state, and the
 * provisioning is idempotent under a row lock (same notification twice =
 * one effect).
 */
class ProcessPaymentIpn
{
    public function __construct(
        private PaymentGateway $gateway,
        private ActivateSubscription $activate,
    ) {}

    /**
     * @param  array<string, mixed>  $payload
     */
    public function handle(array $payload): void
    {
        $token = $this->gateway->invoiceToken($payload);
        $payment = $token ? Payment::where('invoice_token', $token)->first() : null;
        $signatureValid = $this->gateway->verifyIpn($payload);

        if ($payment) {
            Transaction::create([
                'payment_id' => $payment->id,
                'event' => 'ipn_received',
                'external_ref' => $token,
                'signature_valid' => $signatureValid,
                'payload' => $payload,
            ]);
        }

        // Ignore unauthenticated or unknown notifications — no state change.
        if (! $signatureValid || ! $payment) {
            return;
        }

        $completed = $this->gateway->isCompleted($payload);

        DB::transaction(function () use ($payment, $completed) {
            $locked = Payment::whereKey($payment->id)->lockForUpdate()->first();

            if ($locked->isPaid()) {
                return; // already provisioned
            }

            if (! $completed) {
                $locked->update(['status' => PaymentStatus::Failed]);

                return;
            }

            $locked->update(['status' => PaymentStatus::Paid]);

            if ($locked->purpose === PaymentPurpose::Subscription) {
                $this->activate->handle($locked);
            }
            // verification_badge is provisioned in Lot 5.
        });
    }
}
