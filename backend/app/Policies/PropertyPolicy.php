<?php

namespace App\Policies;

use App\Models\Property;
use App\Models\User;

class PropertyPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Property $property): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->role === 'agency';
    }

    public function update(User $user, Property $property): bool
    {
        return $this->owns($user, $property);
    }

    public function delete(User $user, Property $property): bool
    {
        return $this->owns($user, $property);
    }

    /**
     * The property belongs to the agency owned by this user.
     * Uses the relation as a query (not attribute access) to stay
     * compatible with preventLazyLoading.
     */
    private function owns(User $user, Property $property): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        return (int) $property->agency()->value('user_id') === $user->id;
    }
}
