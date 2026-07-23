<?php

namespace App\Payments;

use App\Models\Payment;
use App\Payments\Contracts\PaymentGateway;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class PayDunyaGateway implements PaymentGateway
{
    private string $baseUrl;

    public function __construct(private array $config)
    {
        $this->baseUrl = ($config['mode'] ?? 'test') === 'live'
            ? 'https://app.paydunya.com/api/v1'
            : 'https://app.paydunya.com/sandbox-api/v1';
    }

    public function createInvoice(Payment $payment, string $description): GatewayInvoice
    {
        $response = Http::withHeaders($this->headers())
            ->post($this->baseUrl.'/checkout-invoice/create', [
                'invoice' => [
                    'total_amount' => $payment->amount,
                    'description' => $description,
                ],
                'store' => ['name' => config('app.name')],
                'custom_data' => ['payment_id' => $payment->id],
                'actions' => [
                    'callback_url' => route('webhooks.paydunya'),
                    'return_url' => rtrim((string) config('app.frontend_url'), '/').'/agency/subscription',
                ],
            ]);

        if (! $response->successful() || (string) $response->json('response_code') !== '00') {
            throw new RuntimeException('PayDunya invoice creation failed: '.$response->body());
        }

        return new GatewayInvoice(
            token: $response->json('token'),
            redirectUrl: $response->json('response_text'),
        );
    }

    public function verifyIpn(array $payload): bool
    {
        // PayDunya IPN carries hash = sha512(MASTER key). Cheap first gate only;
        // the authoritative check is confirm() below.
        $expected = hash('sha512', (string) ($this->config['master_key'] ?? ''));

        return isset($payload['hash']) && hash_equals($expected, (string) $payload['hash']);
    }

    public function invoiceToken(array $payload): ?string
    {
        return $payload['invoice']['token'] ?? $payload['token'] ?? null;
    }

    public function confirm(string $token): InvoiceConfirmation
    {
        $response = Http::withHeaders($this->headers())
            ->get($this->baseUrl.'/checkout-invoice/confirm/'.$token);

        if (! $response->successful()) {
            return InvoiceConfirmation::notFound();
        }

        return new InvoiceConfirmation(
            found: true,
            completed: $response->json('status') === 'completed',
            amount: (int) $response->json('invoice.total_amount'),
        );
    }

    /**
     * @return array<string, string>
     */
    private function headers(): array
    {
        return [
            'PAYDUNYA-MASTER-KEY' => (string) ($this->config['master_key'] ?? ''),
            'PAYDUNYA-PRIVATE-KEY' => (string) ($this->config['private_key'] ?? ''),
            'PAYDUNYA-TOKEN' => (string) ($this->config['token'] ?? ''),
        ];
    }
}
