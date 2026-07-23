<?php

namespace App\Actions\Subscription;

use App\Enums\SubscriptionStatus;
use App\Models\Payment;
use App\Models\Plan;
use App\Models\Subscription;

class ActivateSubscription
{
    /**
     * Activate or extend the agency's subscription from a paid subscription
     * payment. Freezes price/quota so later plan edits never rewrite history.
     * If the subscription is still active, the new period is appended to the end.
     */
    public function handle(Payment $payment): Subscription
    {
        $plan = Plan::findOrFail($payment->plan_id);

        $subscription = Subscription::firstOrNew(['agency_id' => $payment->agency_id]);

        $base = $subscription->ends_at && $subscription->ends_at->isFuture()
            ? $subscription->ends_at
            : now();

        $subscription->fill([
            'plan_id' => $plan->id,
            'status' => SubscriptionStatus::Active,
            'price_snapshot' => $payment->amount,
            'quota_snapshot' => [
                'property_quota' => $plan->property_quota,
                'featured_quota' => $plan->featured_quota,
            ],
            'starts_at' => $subscription->starts_at ?? now(),
            'ends_at' => $base->copy()->addMonths($plan->billing_period_months),
        ])->save();

        $payment->update(['subscription_id' => $subscription->id]);

        return $subscription;
    }
}
