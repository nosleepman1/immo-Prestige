<?php

namespace App\Console\Commands;

use App\Actions\Rental\GenerateInstallments;
use App\Models\Lease;
use Illuminate\Console\Command;

/**
 * Keeps every active lease supplied with instalments up to the horizon.
 *
 * Safe to run twice: the unique index on (lease, period_start) is what
 * guarantees that, not a check the command performs.
 */
class GenerateLeaseInstallments extends Command
{
    protected $signature = 'rentals:generate-installments';

    protected $description = 'Crée les échéances à venir des baux actifs';

    public function handle(GenerateInstallments $generate): int
    {
        $leases = 0;
        $created = 0;

        Lease::query()->active()->chunkById(100, function ($chunk) use ($generate, &$leases, &$created) {
            foreach ($chunk as $lease) {
                $leases++;
                $created += $generate->handle($lease)->count();
            }
        });

        $this->info("{$leases} baux parcourus, {$created} échéances créées.");

        return self::SUCCESS;
    }
}
