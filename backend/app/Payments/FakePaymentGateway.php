<?php

namespace App\Payments;

use App\Models\Payment;
use App\Payments\Contracts\PaymentGateway;

/**
 * Test/local double: no network. Deterministic token, signature accepted when
 * the payload carries a truthy `signature_valid` flag.
 */
class FakePaymentGateway implements PaymentGateway
{
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

    public function isCompleted(array $payload): bool
    {
        return ($payload['status'] ?? null) === 'completed';
    }
}
