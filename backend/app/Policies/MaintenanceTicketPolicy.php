<?php

namespace App\Policies;

use App\Models\Agency;
use App\Models\MaintenanceTicket;
use App\Models\User;

/**
 * RG-L21: only the tenant of a lease opens a ticket on that lease.
 *
 * Both sides read and comment; only the agency moves the status, because only
 * the agency can act on the problem.
 */
class MaintenanceTicketPolicy
{
    public function view(User $user, MaintenanceTicket $ticket): bool
    {
        return $this->isTenant($user, $ticket) || $this->isOwningAgency($user, $ticket) || $user->isAdmin();
    }

    public function comment(User $user, MaintenanceTicket $ticket): bool
    {
        return $this->isTenant($user, $ticket) || $this->isOwningAgency($user, $ticket);
    }

    /**
     * Attaching a photo. The tenant documents the problem; the agency documents
     * the repair.
     */
    public function attachImage(User $user, MaintenanceTicket $ticket): bool
    {
        return $this->comment($user, $ticket);
    }

    public function updateStatus(User $user, MaintenanceTicket $ticket): bool
    {
        return $this->isOwningAgency($user, $ticket);
    }

    private function isTenant(User $user, MaintenanceTicket $ticket): bool
    {
        return (int) $ticket->lease()->value('tenant_user_id') === $user->id;
    }

    private function isOwningAgency(User $user, MaintenanceTicket $ticket): bool
    {
        $agencyId = $ticket->lease()->value('agency_id');

        return $agencyId !== null && (int) Agency::whereKey($agencyId)->value('user_id') === $user->id;
    }
}
