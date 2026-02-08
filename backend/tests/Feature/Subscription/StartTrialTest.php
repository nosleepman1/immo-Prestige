<?php

namespace Tests\Feature\Subscription;

use App\Enums\SubscriptionStatus;
use App\Models\Agency;
use App\Models\PasswordSetupToken;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StartTrialTest extends TestCase
{
    use RefreshDatabase;

    public function test_defining_the_password_starts_a_30_day_trial(): void
    {
        $user = User::factory()->agency()->create(['email' => 'agence@example.com', 'password' => null]);
        Agency::factory()->create(['user_id' => $user->id, 'activated_at' => null]);

        $plaintext = 'plain-setup-token';
        PasswordSetupToken::create([
            'user_id' => $user->id,
            'token' => hash('sha256', $plaintext),
            'expires_at' => now()->addDay(),
        ]);

        $this->postJson('/api/v1/agency/password', [
            'email' => 'agence@example.com',
            'token' => $plaintext,
            'password' => 'passer123',
            'password_confirmation' => 'passer123',
        ])->assertOk();

        $subscription = Subscription::first();
        $this->assertNotNull($subscription);
        $this->assertSame(SubscriptionStatus::Trialing, $subscription->status);
        $this->assertTrue($subscription->trial_ends_at->between(now()->addDays(29), now()->addDays(31)));
        $this->assertTrue($subscription->isActive());
    }
}
