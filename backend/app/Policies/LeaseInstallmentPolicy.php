<?php

namespace App\Policies;

use App\Models\LeaseInstallment;
use App\Models\User;

/**
 * The tenant consults and settles; the agency consults and records cash. Only
 * the agency can record cash, because only the agency can have received it.
 */
class LeaseInstallmentPolicy
{
    public function view(User $user, LeaseInstallment $installment): bool
    {
        return $this->isTenant($user, $installment) || $this->isOwningAgency($user, $installment) || $user->isAdmin();
    }

    /**
     * Downloading the receipt. Not open to admins: it names both parties and
     * the sum that changed hands.
     */
    public function downloadReceipt(User $user, LeaseInstallment $installment): bool
    {
        return $this->isTenant($user, $installment) || $this->isOwningAgency($user, $installment);
    }

    public function pay(User $user, LeaseInstallment $installment): bool
    {
        return $this->isTenant($user, $installment);
    }

    /**
     * RG-L19: a cash receipt is recorded by the agency, under the name of the
     * agent who took the money.
     */
    public function recordCash(User $user, LeaseInstallment $installment): bool
    {
        return $this->isOwningAgency($user, $installment);
    }

    private function isTenant(User $user, LeaseInstallment $installment): bool
    {
        return (int) $installment->lease()->value('tenant_user_id') === $user->id;
    }

    private function isOwningAgency(User $user, LeaseInstallment $installment): bool
    {
        $agencyId = $installment->lease()->value('agency_id');

        return $agencyId !== null
            && (int) \App\Models\Agency::whereKey($agencyId)->value('user_id') === $user->id;
    }
}
