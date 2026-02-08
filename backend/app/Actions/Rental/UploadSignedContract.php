<?php

namespace App\Actions\Rental;

use App\Enums\LeaseStatus;
use App\Exceptions\LeaseTransitionException;
use App\Models\Lease;
use App\Notifications\SignedContractUploaded;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

/**
 * The tenant returns the printed, signed, scanned contract.
 *
 * RG-L11: only a lease waiting for its signature accepts one. Re-uploading is
 * allowed while it waits — a first scan is often unreadable, and forcing the
 * agency to reject it before a second attempt would help nobody.
 */
class UploadSignedContract
{
    /**
     * @throws LeaseTransitionException
     */
    public function handle(Lease $lease, UploadedFile $file): Lease
    {
        if ($lease->status !== LeaseStatus::PendingSignature) {
            throw new LeaseTransitionException(
                'téléverser le contrat signé',
                $lease->status,
                [LeaseStatus::PendingSignature],
            );
        }

        // Replacing a previous attempt: the superseded scan leaves the disk
        // rather than lingering as an unreferenced copy of a signed contract.
        if ($lease->signed_contract_path) {
            Storage::disk('local')->delete($lease->signed_contract_path);
        }

        $lease->update([
            'signed_contract_path' => $file->store("leases/{$lease->id}/signed", 'local'),
            'signed_at' => now(),
            // A new attempt clears the previous refusal: the reason described
            // the old scan, and leaving it would misdescribe this one.
            'signature_rejection_reason' => null,
        ]);

        DB::afterCommit(function () use ($lease) {
            $agencyUser = $lease->agency()->with('user')->first()?->user;

            $agencyUser?->notify(new SignedContractUploaded($lease->load(['property', 'tenant'])));
        });

        return $lease;
    }
}
