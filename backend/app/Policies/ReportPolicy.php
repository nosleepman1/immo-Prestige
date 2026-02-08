<?php

namespace App\Policies;

use App\Models\User;

class ReportPolicy
{
    public function create(User $user): bool
    {
        return true; // any authenticated role; auth:sanctum gates guests
    }

    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    public function review(User $user): bool
    {
        return $user->isAdmin();
    }
}
