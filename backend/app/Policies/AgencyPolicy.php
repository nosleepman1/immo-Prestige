<?php

namespace App\Policies;

use App\Models\Agency;
use App\Models\User;

class AgencyPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->role === 'admin';
    }

    public function view(User $user, Agency $agency): bool
    {
        return $user->id === $agency->user_id || $user->role === 'admin';
    }

    public function create(User $user): bool
    {
        return $user->role === 'agency';
    }

    public function update(User $user, Agency $agency): bool
    {
        return $user->id === $agency->user_id || $user->role === 'admin';
    }

    public function delete(User $user, Agency $agency): bool
    {
        return $user->id === $agency->user_id || $user->role === 'admin';
    }
}
