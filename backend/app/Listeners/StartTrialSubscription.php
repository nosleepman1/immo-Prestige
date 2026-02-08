<?php

namespace App\Listeners;

use App\Enums\SubscriptionStatus;
use App\Events\AgencyActivated;
use App\Models\Subscription;

class StartTrialSubscription
{
    /**
     * Start the 30-day trial when an agency activates (defines its password).
     * Idempotent: never creates a second subscription.
     */
    public function handle(AgencyActivated $event): void
    {
        $agency = $event->agency;

        if ($agency->subscriptions()->exists()) {
            return;
        }

        $start = $agency->activated_at ?? now();

        Subscription::create([
            'agency_id' => $agency->id,
            'status' => SubscriptionStatus::Trialing,
            'starts_at' => $start,
            'trial_ends_at' => $start->copy()->addDays(30),
        ]);
    }
}
