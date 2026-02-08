<?php

namespace Tests\Feature\Verification;

use App\Models\Agency;
use App\Models\Payment;
use App\Payments\FakePaymentGateway;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BadgeWebhookTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        FakePaymentGateway::reset();
    }

    public function test_a_paid_badge_ipn_verifies_the_agency(): void
    {
        $agency = Agency::factory()->create(['verified_until' => null]);
        $payment = Payment::factory()->create([
            'agency_id' => $agency->id,
            'plan_id' => null,
            'purpose' => 'verification_badge',
            'amount' => 10000,
            'status' => 'pending',
            'invoice_token' => 'badge-tok',
        ]);

        $this->postJson('/api/v1/webhooks/paydunya', [
            'invoice' => ['token' => 'badge-tok'],
            'status' => 'completed',
            'signature_valid' => true,
        ])->assertOk();

        $this->assertDatabaseHas('payments', ['id' => $payment->id, 'status' => 'paid']);

        $agency->refresh();
        $this->assertTrue($agency->isVerified());
        $this->assertTrue($agency->verified_until->greaterThan(now()->addDays(27)));
    }

    public function test_a_replayed_badge_ipn_does_not_extend_twice(): void
    {
        $agency = Agency::factory()->create(['verified_until' => null]);
        Payment::factory()->create([
            'agency_id' => $agency->id,
            'plan_id' => null,
            'purpose' => 'verification_badge',
            'amount' => 10000,
            'status' => 'pending',
            'invoice_token' => 'badge-tok',
        ]);

        $ipn = ['invoice' => ['token' => 'badge-tok'], 'status' => 'completed', 'signature_valid' => true];

        $this->postJson('/api/v1/webhooks/paydunya', $ipn)->assertOk();
        $first = $agency->fresh()->verified_until;

        $this->postJson('/api/v1/webhooks/paydunya', $ipn)->assertOk();
        $this->assertEquals($first, $agency->fresh()->verified_until);
    }

    public function test_the_badge_lapses_when_verified_until_passes(): void
    {
        $lapsed = Agency::factory()->create(['verified_until' => now()->subDay()]);
        $active = Agency::factory()->create(['verified_until' => now()->addDays(10)]);

        $this->assertFalse($lapsed->isVerified());
        $this->assertTrue($active->isVerified());
    }
}
