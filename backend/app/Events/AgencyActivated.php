<?php

namespace App\Events;

use App\Models\Agency;
use Illuminate\Foundation\Events\Dispatchable;

/**
 * Fired when an agency defines its password (account becomes active).
 * Lot 4 listens to this to start the 30-day trial subscription.
 */
class AgencyActivated
{
    use Dispatchable;

    public function __construct(public Agency $agency) {}
}
