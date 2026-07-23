<?php

namespace App\Payments\Contracts;

use App\Models\Payment;
use App\Payments\GatewayInvoice;

/**
 * I/O boundary to the payment provider. Justified as an interface: it is
 * replaced by a fake in tests (no real network calls) and could gain a second
 * provider. Implemented by PayDunyaGateway (prod) and FakePaymentGateway (test).
 */
interface PaymentGateway
{
    public function createInvoice(Payment $payment, string $description): GatewayInvoice;

    /**
     * Verify the authenticity of an incoming IPN payload (provider signature).
     *
     * @param  array<string, mixed>  $payload
     */
    public function verifyIpn(array $payload): bool;

    /**
     * The invoice token an IPN payload refers to.
     *
     * @param  array<string, mixed>  $payload
     */
    public function invoiceToken(array $payload): ?string;

    /**
     * Whether the IPN payload reports a completed/successful payment.
     *
     * @param  array<string, mixed>  $payload
     */
    public function isCompleted(array $payload): bool;
}
