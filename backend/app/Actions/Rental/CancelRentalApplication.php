<?php

namespace App\Actions\Rental;

use App\Enums\RentalApplicationStatus;
use App\Exceptions\RentalApplicationNotOpenException;
use App\Models\RentalApplication;

/**
 * The candidate withdraws. The record is kept — the agency's history of who
 * applied and gave up is worth more than a clean table — but it stops blocking
 * a future application on the same property.
 */
class CancelRentalApplication
{
    /**
     * @throws RentalApplicationNotOpenException
     */
    public function handle(RentalApplication $application): RentalApplication
    {
        if (! $application->status->isCancellable()) {
            throw new RentalApplicationNotOpenException('annulée');
        }

        $application->update(['status' => RentalApplicationStatus::Cancelled]);

        return $application;
    }
}
