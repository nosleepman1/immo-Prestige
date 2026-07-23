<?php

namespace App\Console\Commands;

use App\Enums\SubscriptionStatus;
use App\Models\Subscription;
use Illuminate\Console\Command;

class ExpireSubscriptions extends Command
{
    protected $signature = 'subscriptions:expire';

    protected $description = 'Mark trialing/active subscriptions whose term has passed as expired';

    public function handle(): int
    {
        $now = now();

        $trials = Subscription::where('status', SubscriptionStatus::Trialing->value)
            ->whereNotNull('trial_ends_at')
            ->where('trial_ends_at', '<', $now)
            ->update(['status' => SubscriptionStatus::Expired->value]);

        $active = Subscription::where('status', SubscriptionStatus::Active->value)
            ->whereNotNull('ends_at')
            ->where('ends_at', '<', $now)
            ->update(['status' => SubscriptionStatus::Expired->value]);

        $this->info("Expired {$trials} trial(s) and {$active} active subscription(s).");

        return self::SUCCESS;
    }
}
