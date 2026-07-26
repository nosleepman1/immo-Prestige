<?php

namespace App\Actions\Rental;

use App\Enums\LeaseStatus;
use App\Exceptions\LeaseTransitionException;
use App\Models\Lease;
use App\Models\User;
use App\Notifications\LeaseSignatureRejected;
use App\Notifications\LeaseSignatureValidated;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

/**
 * RG-L12: the agency checks the returned scan. Accepting opens the payment
 * stage; refusing sends the lease back to waiting for a signature, with the
 * reason attached so the tenant knows what to redo.
 */
class ReviewLeaseSignature
{
    /**
     * @throws LeaseTransitionException
     */
    public function validate(Lease $lease, User $reviewer): Lease
    {
        $this->assertAwaitingReview($lease, 'valider la signature');

        $lease->update([
            'status' => LeaseStatus::PendingPayment,
            'validated_by' => $reviewer->id,
            'validated_at' => now(),
            'signature_rejection_reason' => null,
        ]);

        DB::afterCommit(fn () => $lease->tenant?->notify(
            new LeaseSignatureValidated($lease->load(['property', 'agency']))
        ));

        return $lease;
    }

    /**
     * @throws LeaseTransitionException
     */
    public function reject(Lease $lease, User $reviewer, string $reason): Lease
    {
        $this->assertAwaitingReview($lease, 'refuser la signature');

        // The refused scan leaves the disk with its reference: an unreadable or
        // unsigned copy of a contract has no reason to survive its rejection.
        Storage::disk('local')->delete($lease->signed_contract_path);

        $lease->update([
            'status' => LeaseStatus::PendingSignature,
            'signature_rejection_reason' => $reason,
            'signed_contract_path' => null,
            'signed_at' => null,
            // `validated_*` records the last signature review, whichever way it
            // went; the rejection reason is what says which.
            'validated_by' => $reviewer->id,
            'validated_at' => now(),
        ]);

        DB::afterCommit(fn () => $lease->tenant?->notify(
            new LeaseSignatureRejected($lease->load(['property', 'agency']))
        ));

        return $lease;
    }

    /**
     * A signature can only be reviewed once it exists: a lease still waiting for
     * the scan has nothing to look at.
     *
     * @throws LeaseTransitionException
     */
    private function assertAwaitingReview(Lease $lease, string $action): void
    {
        if ($lease->status !== LeaseStatus::PendingSignature || $lease->signed_contract_path === null) {
            throw new LeaseTransitionException($action, $lease->status, [LeaseStatus::PendingSignature]);
        }
    }
}
