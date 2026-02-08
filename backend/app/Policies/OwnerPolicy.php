<?php

namespace App\Policies;

use App\Models\Owner;
use App\Models\User;

/**
 * Owners are strictly agency-scoped: an agency sees and edits only the owners
 * it registered. Nothing about owners is public.
 */
class OwnerPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isAgency() || $user->isAdmin();
    }

    public function view(User $user, Owner $owner): bool
    {
        return $this->owns($user, $owner);
    }

    public function create(User $user): bool
    {
        return $user->isAgency();
    }

    public function update(User $user, Owner $owner): bool
    {
        return $this->owns($user, $owner);
    }

    public function delete(User $user, Owner $owner): bool
    {
        return $this->owns($user, $owner);
    }

    /**
     * Uses the relation as a query (not attribute access) to stay compatible
     * with preventLazyLoading, like PropertyPolicy.
     */
    private function owns(User $user, Owner $owner): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return (int) $owner->agency()->value('user_id') === $user->id;
    }
}
