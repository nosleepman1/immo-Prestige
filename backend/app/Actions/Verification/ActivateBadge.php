<?php

namespace App\Actions\Verification;

use App\Models\Agency;
use App\Models\Payment;
use App\Models\Setting;

class ActivateBadge
{
    /**
     * Extend the agency's verified_until by the configured badge period. The
     * badge is active while verified_until is in the future; it simply lapses
     * when payments stop (no cron needed).
     */
    public function handle(Payment $payment): Agency
    {
        $agency = Agency::whereKey($payment->agency_id)->lockForUpdate()->firstOrFail();

        $months = Setting::integer('verification_badge_period_months', 1);

        $base = $agency->verified_until && $agency->verified_until->isFuture()
            ? $agency->verified_until
            : now();

        $agency->update(['verified_until' => $base->copy()->addMonths($months)]);

        return $agency;
    }
}
