<?php

namespace App\Policies;

use App\Models\Property;
use App\Models\PropertyImage;
use App\Models\User;

class PropertyImagePolicy
{
    public function create(User $user): bool
    {
        return $user->isAgency();
    }

    public function update(User $user, PropertyImage $propertyImage): bool
    {
        return $this->owns($user, $propertyImage);
    }

    public function delete(User $user, PropertyImage $propertyImage): bool
    {
        return $this->owns($user, $propertyImage);
    }

    /**
     * Single query joining through property -> agency; no relation lazy-load.
     */
    private function owns(User $user, PropertyImage $propertyImage): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        $agencyUserId = Property::whereKey($propertyImage->property_id)
            ->join('agencies', 'agencies.id', '=', 'properties.agency_id')
            ->value('agencies.user_id');

        return (int) $agencyUserId === $user->id;
    }
}
