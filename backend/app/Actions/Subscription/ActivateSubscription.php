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
     * payment. Freezes price/quota so a later plan edit never rewrites history.
     * The new period is appended after the latest still-running term (remaining
     * trial or paid days are preserved, not forfeited).
     */
    public function handle(Payment $payment): Subscription
    {
        $plan = Plan::findOrFail($payment->plan_id);

        $subscription = Subscription::where('agency_id', $payment->agency_id)
            ->lockForUpdate()
            ->first()
            ?? new Subscription(['agency_id' => $payment->agency_id]);

        $base = now();
        foreach ([$subscription->ends_at, $subscription->trial_ends_at] as $date) {
            if ($date && $date->isFuture() && $date->greaterThan($base)) {
                $base = $date;
            }
        }

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
