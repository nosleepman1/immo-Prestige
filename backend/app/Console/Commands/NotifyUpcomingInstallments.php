<?php

namespace App\Console\Commands;

use App\Enums\InstallmentStatus;
use App\Models\LeaseInstallment;
use App\Notifications\InstallmentDueSoon;
use Illuminate\Console\Command;

/**
 * Warns tenants five days before an instalment falls due.
 *
 * Preventing an arrear costs one message; recovering one costs a relationship.
 * Targets the exact day rather than a window, so a tenant is warned once.
 */
class NotifyUpcomingInstallments extends Command
{
    protected $signature = 'rentals:notify-due-soon {--days=5}';

    protected $description = 'Prévient les locataires des échéances proches';

    public function handle(): int
    {
        $target = today()->addDays((int) $this->option('days'));
        $notified = 0;

        LeaseInstallment::query()
            ->whereIn('status', [InstallmentStatus::Pending->value, InstallmentStatus::PartiallyPaid->value])
            ->whereDate('due_date', $target)
            ->with('lease.tenant')
            ->chunkById(200, function ($chunk) use (&$notified) {
                foreach ($chunk as $installment) {
                    $installment->lease?->tenant?->notify(new InstallmentDueSoon($installment));
                    $notified++;
                }
            });

        $this->info("{$notified} locataires prévenus.");

        return self::SUCCESS;
    }
}
