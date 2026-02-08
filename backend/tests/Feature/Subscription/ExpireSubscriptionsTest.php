<?php

namespace Tests\Feature\Subscription;

use App\Models\Subscription;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExpireSubscriptionsTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_expires_lapsed_trials_and_active_subscriptions(): void
    {
        $lapsedTrial = Subscription::factory()->create([
            'status' => 'trialing',
            'trial_ends_at' => now()->subDay(),
        ]);
        $lapsedActive = Subscription::factory()->active()->create([
            'ends_at' => now()->subDay(),
        ]);
        $stillTrialing = Subscription::factory()->create([
            'status' => 'trialing',
            'trial_ends_at' => now()->addDays(10),
        ]);

        $this->artisan('subscriptions:expire')->assertSuccessful();

        $this->assertSame('expired', $lapsedTrial->fresh()->status->value);
        $this->assertSame('expired', $lapsedActive->fresh()->status->value);
        $this->assertSame('trialing', $stillTrialing->fresh()->status->value);
    }
}
