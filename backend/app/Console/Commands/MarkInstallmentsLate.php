<?php

namespace App\Console\Commands;

use App\Enums\InstallmentStatus;
use App\Models\LeaseInstallment;
use App\Notifications\InstallmentLate;
use Illuminate\Console\Command;

/**
 * RG-L18: an instalment still owed past its due date becomes `late`.
 *
 * The tenant is told once, on the day it flips. Repeated chasing is out of
 * scope, and a daily reminder would train them to ignore the channel.
 */
class MarkInstallmentsLate extends Command
{
    protected $signature = 'rentals:mark-late';

    protected $description = 'Bascule en retard les échéances dépassées non soldées';

    public function handle(): int
    {
        $marked = 0;

        LeaseInstallment::query()
            ->whereIn('status', [InstallmentStatus::Pending->value, InstallmentStatus::PartiallyPaid->value])
            ->whereDate('due_date', '<', today())
            ->with('lease.tenant')
            ->chunkById(200, function ($chunk) use (&$marked) {
                foreach ($chunk as $installment) {
                    $installment->update(['status' => InstallmentStatus::Late]);
                    $installment->lease?->tenant?->notify(new InstallmentLate($installment));
                    $marked++;
                }
            });

        $this->info("{$marked} échéances passées en retard.");

        return self::SUCCESS;
    }
}
