<?php

namespace App\Policies;

use App\Models\User;

class LikePolicy
{
    public function create(User $user): bool
    {
        return true; // any authenticated role; auth:sanctum gates guests
    }
}
