<?php

namespace App\Payments\Contracts;

use App\Models\Payment;
use App\Payments\GatewayInvoice;
use App\Payments\InvoiceConfirmation;

/**
 * I/O boundary to the payment provider. Justified as an interface: it is
 * replaced by a fake in tests (no real network calls) and could gain a second
 * provider. Implemented by PayDunyaGateway (prod) and FakePaymentGateway (test).
 */
interface PaymentGateway
{
    public function createInvoice(Payment $payment, string $description): GatewayInvoice;

    /**
     * Cheap first-gate authenticity check on an incoming IPN payload.
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
     * Re-fetch the authoritative invoice state from the provider. This — not the
     * IPN body — is the source of truth used before provisioning.
     */
    public function confirm(string $token): InvoiceConfirmation;
}
