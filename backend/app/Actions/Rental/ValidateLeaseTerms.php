<?php

namespace App\Actions\Rental;

use App\Enums\LeaseStatus;
use App\Exceptions\LeaseTransitionException;
use App\Models\Lease;

/**
 * The tenant has read the generated contract and accepts its terms. The lease
 * moves on to waiting for the signed paper.
 *
 * This is not a signature: it is the acknowledgement that the figures are the
 * ones agreed. The signature itself stays on paper (see UploadSignedContract).
 */
class ValidateLeaseTerms
{
    /**
     * @throws LeaseTransitionException
     */
    public function handle(Lease $lease): Lease
    {
        if ($lease->status !== LeaseStatus::PendingValidation) {
            throw new LeaseTransitionException(
                'valider les conditions',
                $lease->status,
                [LeaseStatus::PendingValidation],
            );
        }

        $lease->update(['status' => LeaseStatus::PendingSignature]);

        return $lease;
    }
}
