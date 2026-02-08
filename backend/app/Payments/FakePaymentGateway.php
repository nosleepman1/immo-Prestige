<?php

namespace App\Payments;

use App\Models\Payment;
use App\Payments\Contracts\PaymentGateway;

/**
 * Test/local double: no network. Signature accepted when the payload carries a
 * truthy `signature_valid` flag. confirm() reports the invoice as completed for
 * the payment's own amount, unless a test overrides it via forceConfirmation().
 */
class FakePaymentGateway implements PaymentGateway
{
    /** @var array<string, array{completed: bool, amount: ?int}> */
    private static array $overrides = [];

    public static function forceConfirmation(string $token, bool $completed, ?int $amount = null): void
    {
        self::$overrides[$token] = ['completed' => $completed, 'amount' => $amount];
    }

    public static function reset(): void
    {
        self::$overrides = [];
    }

    public function createInvoice(Payment $payment, string $description): GatewayInvoice
    {
        $token = 'fake-invoice-'.$payment->id;

        return new GatewayInvoice(
            token: $token,
            redirectUrl: 'https://sandbox.paydunya.test/checkout/'.$token,
        );
    }

    public function verifyIpn(array $payload): bool
    {
        return (bool) ($payload['signature_valid'] ?? false);
    }

    public function invoiceToken(array $payload): ?string
    {
        return $payload['invoice']['token'] ?? $payload['token'] ?? null;
    }

    public function confirm(string $token): InvoiceConfirmation
    {
        $payment = Payment::where('invoice_token', $token)->first();

        if (! $payment) {
            return InvoiceConfirmation::notFound();
        }

        $override = self::$overrides[$token] ?? null;

        return new InvoiceConfirmation(
            found: true,
            completed: $override['completed'] ?? true,
            amount: $override['amount'] ?? $payment->amount,
        );
    }
}
