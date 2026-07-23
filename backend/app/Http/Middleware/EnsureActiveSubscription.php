<?php

namespace App\Http\Middleware;

use App\Exceptions\SubscriptionInactiveException;
use App\Models\Agency;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Guards endpoints reserved to agencies with an active subscription (trial
 * counts as active). Returns 402 SUBSCRIPTION_INACTIVE, not a generic 403.
 * Applied to publication in Lot 6b.
 */
class EnsureActiveSubscription
{
    public function handle(Request $request, Closure $next): Response
    {
        $agency = Agency::whereBelongsTo($request->user())->first();

        if (! $agency || ! $agency->hasActiveSubscription()) {
            throw new SubscriptionInactiveException();
        }

        return $next($request);
    }
}
