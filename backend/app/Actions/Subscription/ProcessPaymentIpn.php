<?php

namespace App\Actions\Subscription;

use App\Actions\Verification\ActivateBadge;
use App\Enums\PaymentPurpose;
use App\Enums\PaymentStatus;
use App\Models\Payment;
use App\Models\Transaction;
use App\Payments\Contracts\PaymentGateway;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

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
        private ActivateBadge $activateBadge,
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

        if (! $signatureValid) {
            Log::channel('business')->warning('PayDunya IPN with invalid signature', ['token' => $token]);
        }

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
            Log::channel('business')->error('PayDunya IPN amount mismatch — possible tampering', [
                'payment_id' => $payment->id,
                'expected' => $payment->amount,
                'confirmed' => $confirmation->amount,
            ]);

            return;
        }

        DB::transaction(function () use ($payment) {
            $locked = Payment::whereKey($payment->id)->lockForUpdate()->first();

            if ($locked->isPaid()) {
                return; // already provisioned
            }

            $locked->update(['status' => PaymentStatus::Paid]);

            match ($locked->purpose) {
                PaymentPurpose::Subscription => $this->activate->handle($locked),
                PaymentPurpose::VerificationBadge => $this->activateBadge->handle($locked),
                // Fail loud (and roll back the Paid mark) on an unhandled purpose.
                default => throw new \LogicException("Unhandled payment purpose: {$locked->purpose->value}"),
            };
        });
    }
}
