<?php

namespace App\Policies;

use App\Models\Lease;
use App\Models\User;

/**
 * A lease has exactly two parties. Reading it is open to both; each action
 * belongs to whoever is actually meant to perform it — the tenant validates and
 * signs, the agency checks and terminates.
 */
class LeasePolicy
{
    public function view(User $user, Lease $lease): bool
    {
        return $this->isTenant($user, $lease) || $this->isOwningAgency($user, $lease) || $user->isAdmin();
    }

    /**
     * Downloading the contract, generated or signed. Not open to admins: the
     * document carries both parties' identity and the rent they agreed on.
     */
    public function downloadContract(User $user, Lease $lease): bool
    {
        return $this->isTenant($user, $lease) || $this->isOwningAgency($user, $lease);
    }

    public function validateTerms(User $user, Lease $lease): bool
    {
        return $this->isTenant($user, $lease);
    }

    public function uploadSignature(User $user, Lease $lease): bool
    {
        return $this->isTenant($user, $lease);
    }

    /**
     * RG-L12: checking the returned scan is the agency's job alone.
     */
    public function reviewSignature(User $user, Lease $lease): bool
    {
        return $this->isOwningAgency($user, $lease);
    }

    private function isTenant(User $user, Lease $lease): bool
    {
        return (int) $lease->tenant_user_id === $user->id;
    }

    private function isOwningAgency(User $user, Lease $lease): bool
    {
        return (int) $lease->agency()->value('user_id') === $user->id;
    }
}
