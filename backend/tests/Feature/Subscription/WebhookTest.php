<?php

namespace Tests\Feature\Subscription;

use App\Models\Agency;
use App\Models\Payment;
use App\Models\Plan;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WebhookTest extends TestCase
{
    use RefreshDatabase;

    private function pendingPayment(string $token = 'tok-1'): Payment
    {
        $agency = Agency::factory()->create();
        $plan = Plan::factory()->create(['billing_period_months' => 1, 'price' => 15000]);

        return Payment::factory()->create([
            'agency_id' => $agency->id,
            'plan_id' => $plan->id,
            'purpose' => 'subscription',
            'amount' => 15000,
            'status' => 'pending',
            'invoice_token' => $token,
        ]);
    }

    private function ipn(string $token, bool $signatureValid = true, string $status = 'completed'): array
    {
        return [
            'invoice' => ['token' => $token],
            'status' => $status,
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

        // One subscription, one paid payment; the second notification did not re-provision.
        $this->assertDatabaseCount('subscriptions', 1);
        $this->assertSame(1, Payment::where('status', 'paid')->count());
        $this->assertDatabaseCount('transactions', 2); // both notifications journalled
    }

    public function test_an_unknown_token_is_ignored(): void
    {
        $this->postJson('/api/v1/webhooks/paydunya', $this->ipn('does-not-exist'))->assertOk();

        $this->assertDatabaseCount('subscriptions', 0);
        $this->assertDatabaseCount('transactions', 0);
    }
}
