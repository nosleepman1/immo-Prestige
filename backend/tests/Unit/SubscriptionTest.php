<?php

namespace Tests\Unit;

use App\Enums\SubscriptionStatus;
use App\Models\Subscription;
use Tests\TestCase;

class SubscriptionTest extends TestCase
{
    private function make(SubscriptionStatus $status, array $attrs = []): Subscription
    {
        $s = new Subscription();
        $s->status = $status;
        foreach ($attrs as $k => $v) {
            $s->{$k} = $v;
        }

        return $s;
    }

    public function test_trialing_is_active_before_the_trial_ends(): void
    {
        $this->assertTrue($this->make(SubscriptionStatus::Trialing, ['trial_ends_at' => now()->addDay()])->isActive());
        $this->assertFalse($this->make(SubscriptionStatus::Trialing, ['trial_ends_at' => now()->subDay()])->isActive());
    }

    public function test_active_is_active_before_the_term_ends(): void
    {
        $this->assertTrue($this->make(SubscriptionStatus::Active, ['ends_at' => now()->addMonth()])->isActive());
        $this->assertFalse($this->make(SubscriptionStatus::Active, ['ends_at' => now()->subDay()])->isActive());
    }

    public function test_expired_and_cancelled_are_never_active(): void
    {
        $this->assertFalse($this->make(SubscriptionStatus::Expired, ['ends_at' => now()->addMonth()])->isActive());
        $this->assertFalse($this->make(SubscriptionStatus::Cancelled, ['ends_at' => now()->addMonth()])->isActive());
    }
}
