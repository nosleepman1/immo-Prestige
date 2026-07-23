<?php

namespace Tests\Feature\Subscription;

use App\Models\Agency;
use App\Models\Payment;
use App\Models\Plan;
use App\Models\Subscription;
use App\Payments\FakePaymentGateway;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WebhookTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        FakePaymentGateway::reset();
    }

    private function pendingPayment(string $token = 'tok-1', int $amount = 15000, ?Agency $agency = null): Payment
    {
        $agency ??= Agency::factory()->create();
        $plan = Plan::factory()->create(['billing_period_months' => 1, 'price' => $amount]);

        return Payment::factory()->create([
            'agency_id' => $agency->id,
            'plan_id' => $plan->id,
            'purpose' => 'subscription',
            'amount' => $amount,
            'status' => 'pending',
            'invoice_token' => $token,
        ]);
    }

    private function ipn(string $token, bool $signatureValid = true): array
    {
        return [
            'invoice' => ['token' => $token],
            'status' => 'completed',
            'signature_valid' => $signatureValid,
        ];
    }

    public function test_a_valid_completed_ipn_activates_the_subscription(): void
    {
        $payment = $this->pendingPayment();

        $this->postJson('/api/v1/webhooks/paydunya', $this->ipn('tok-1'))->assertOk();

        $this->assertDatabaseHas('payments', ['id' => $payment->id, 'status' => 'paid']);
        $this->assertDatabaseHas('subscriptions', ['agency_id' => $payment->agency_id, 'status' => 'active']);
        $this->assertDatabaseHas('transactions', ['payment_id' => $payment->id, 'signature_valid' => true]);
    }

    public function test_an_invalid_signature_changes_no_state(): void
    {
        $payment = $this->pendingPayment();

        $this->postJson('/api/v1/webhooks/paydunya', $this->ipn('tok-1', signatureValid: false))->assertOk();

        $this->assertDatabaseHas('payments', ['id' => $payment->id, 'status' => 'pending']);
        $this->assertDatabaseCount('subscriptions', 0);
        $this->assertDatabaseHas('transactions', ['payment_id' => $payment->id, 'signature_valid' => false]);
    }

    public function test_the_ipn_is_idempotent(): void
    {
        $payment = $this->pendingPayment();

        $this->postJson('/api/v1/webhooks/paydunya', $this->ipn('tok-1'))->assertOk();
        $this->postJson('/api/v1/webhooks/paydunya', $this->ipn('tok-1'))->assertOk();

        $this->assertDatabaseCount('subscriptions', 1);
        $this->assertSame(1, Payment::where('status', 'paid')->count());
        $this->assertDatabaseCount('transactions', 2); // both notifications journalled
    }

    public function test_an_unknown_token_is_journalled_but_changes_no_state(): void
    {
        $this->postJson('/api/v1/webhooks/paydunya', $this->ipn('does-not-exist'))->assertOk();

        $this->assertDatabaseCount('subscriptions', 0);
        $this->assertDatabaseHas('transactions', ['payment_id' => null, 'external_ref' => 'does-not-exist']);
    }

    public function test_a_tampered_amount_does_not_activate(): void
    {
        $payment = $this->pendingPayment('tok-1', amount: 15000);
        // Provider confirms a different amount than the payment expects.
        FakePaymentGateway::forceConfirmation('tok-1', completed: true, amount: 500);

        $this->postJson('/api/v1/webhooks/paydunya', $this->ipn('tok-1'))->assertOk();

        $this->assertDatabaseHas('payments', ['id' => $payment->id, 'status' => 'pending']);
        $this->assertDatabaseCount('subscriptions', 0);
    }

    public function test_a_paid_ipn_extends_a_still_running_subscription(): void
    {
        $agency = Agency::factory()->create();
        Subscription::factory()->active()->create([
            'agency_id' => $agency->id,
            'ends_at' => now()->addDays(10),
        ]);
        $payment = $this->pendingPayment('tok-1', amount: 15000, agency: $agency);

        $this->postJson('/api/v1/webhooks/paydunya', $this->ipn('tok-1'))->assertOk();

        // Extended from the old end (+10d), not from now.
        $this->assertTrue(
            Subscription::where('agency_id', $agency->id)->first()->ends_at->greaterThan(now()->addMonth()->addDays(5))
        );
        $this->assertDatabaseCount('subscriptions', 1);
    }
}
