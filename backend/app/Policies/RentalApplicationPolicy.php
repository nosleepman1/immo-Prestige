<?php

namespace App\Policies;

use App\Models\RentalApplication;
use App\Models\User;

/**
 * Two sides, two sets of rights: the candidate owns their application and may
 * complete or withdraw it; the agency instructs the applications filed on its
 * own properties. Neither can act in the other's place.
 */
class RentalApplicationPolicy
{
    public function view(User $user, RentalApplication $application): bool
    {
        return $this->isApplicant($user, $application)
            || $this->isOwningAgency($user, $application)
            || $user->isAdmin();
    }

    public function create(User $user): bool
    {
        // Agencies do not apply to themselves; this is the candidate's move.
        return $user->isUser();
    }

    /**
     * Attaching a supporting document: the candidate's own file.
     */
    public function attachDocument(User $user, RentalApplication $application): bool
    {
        return $this->isApplicant($user, $application);
    }

    public function cancel(User $user, RentalApplication $application): bool
    {
        return $this->isApplicant($user, $application);
    }

    /**
     * RG-L06: only the agency owning the property instructs the application.
     */
    public function review(User $user, RentalApplication $application): bool
    {
        return $this->isOwningAgency($user, $application);
    }

    /**
     * Downloading a supporting document. The agency needs it to instruct, the
     * candidate to check what they sent; nobody else, admin included — these
     * are identity papers and payslips.
     */
    public function downloadDocument(User $user, RentalApplication $application): bool
    {
        return $this->isApplicant($user, $application) || $this->isOwningAgency($user, $application);
    }

    private function isApplicant(User $user, RentalApplication $application): bool
    {
        return (int) $application->applicant_user_id === $user->id;
    }

    /**
     * Uses the relation as a query (not attribute access) to stay compatible
     * with preventLazyLoading, like the other policies.
     */
    private function isOwningAgency(User $user, RentalApplication $application): bool
    {
        return (int) $application->agency()->value('user_id') === $user->id;
    }
}
