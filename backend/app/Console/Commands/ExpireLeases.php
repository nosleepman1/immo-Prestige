<?php

namespace App\Console\Commands;

use App\Enums\LeaseStatus;
use App\Enums\PropertyAvailability;
use App\Models\Lease;
use App\Notifications\LeaseEnded;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * RG-L23: at the end of a lease the property goes back on the market.
 *
 * Runs after the instalment sweeps: a lease that ends today still owed its last
 * month this morning, and marking the property available before that month was
 * ruled on would hide an arrear behind a fresh listing.
 */
class ExpireLeases extends Command
{
    protected $signature = 'rentals:expire-leases';

    protected $description = 'Passe en expiré les baux dont la date de fin est atteinte';

    public function handle(): int
    {
        $expired = 0;

        Lease::query()
            ->where('status', LeaseStatus::Active->value)
            ->whereDate('end_date', '<', today())
            ->with(['tenant', 'agency.user', 'property'])
            ->chunkById(100, function ($chunk) use (&$expired) {
                foreach ($chunk as $lease) {
                    DB::transaction(function () use ($lease) {
                        $lease->update(['status' => LeaseStatus::Expired]);

                        // Only if it is still marked rented by this lease: a
                        // property already re-let must not be pulled back.
                        $lease->property()
                            ->where('availability', PropertyAvailability::Rented->value)
                            ->update(['availability' => PropertyAvailability::Available]);
                    });

                    $lease->tenant?->notify(new LeaseEnded($lease));
                    $lease->agency?->user?->notify(new LeaseEnded($lease));
                    $expired++;
                }
            });

        $this->info("{$expired} baux expirés.");

        return self::SUCCESS;
    }
}
