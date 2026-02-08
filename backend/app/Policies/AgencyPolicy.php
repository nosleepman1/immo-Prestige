<?php

namespace App\Policies;

use App\Models\Agency;
use App\Models\User;

class AgencyPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    public function view(User $user, Agency $agency): bool
    {
        return $user->id === $agency->user_id || $user->isAdmin();
    }

    public function create(User $user): bool
    {
        return $user->isAgency();
    }

    public function update(User $user, Agency $agency): bool
    {
        return $user->id === $agency->user_id || $user->isAdmin();
    }

    public function delete(User $user, Agency $agency): bool
    {
        return $user->id === $agency->user_id || $user->isAdmin();
    }

    /**
     * Only an admin reviews (accepts/refuses) an agency request.
     */
    public function review(User $user, Agency $agency): bool
    {
        return $user->isAdmin();
    }
}
