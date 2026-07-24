<?php

namespace App\Actions\Subscription;

use App\Enums\PaymentPurpose;
use App\Enums\PaymentStatus;
use App\Models\Payment;
use App\Models\Transaction;
use App\Payments\Contracts\PaymentGateway;
use Illuminate\Support\Facades\DB;

/**
 * IPN handling. Every notification is journalled (even forged/unknown ones).
 * A notification only provisions when: its signature is valid, and the invoice
 * — re-confirmed against the provider (the source of truth, not the IPN body) —
 * is completed for the expected amount. Provisioning is idempotent under a lock.
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

        Transaction::create([
            'payment_id' => $payment?->id,
            'event' => 'ipn_received',
            'external_ref' => $token,
            'signature_valid' => $signatureValid,
            'payload' => $payload,
        ]);

        if (! $signatureValid || ! $payment || $payment->isPaid()) {
            return;
        }

        // Source of truth: re-confirm with the provider.
        $confirmation = $this->gateway->confirm($token);

        if (! $confirmation->found || ! $confirmation->completed) {
            return;
        }

        // Reject amount tampering.
        if ($confirmation->amount !== null && $confirmation->amount !== $payment->amount) {
            return;
        }

        DB::transaction(function () use ($payment) {
            $locked = Payment::whereKey($payment->id)->lockForUpdate()->first();

            if ($locked->isPaid()) {
                return; // already provisioned
            }

            $locked->update(['status' => PaymentStatus::Paid]);

            if ($locked->purpose === PaymentPurpose::Subscription) {
                $this->activate->handle($locked);
            }
            // verification_badge is provisioned in Lot 5.
        });
    }
}
