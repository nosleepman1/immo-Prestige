<?php

namespace App\Actions\Property;

use App\Enums\PropertyStatus;
use App\Exceptions\IncompletePropertyListingException;
use App\Exceptions\PropertyQuotaExceededException;
use App\Models\Agency;
use App\Models\Property;

/**
 * Gated by three independent rules, each failing with a distinct message:
 * active subscription (enforced upstream by the subscription.active
 * middleware, 402), plan quota (409) and listing completeness (422).
 */
class PublishProperty
{
    public function handle(Property $property, Agency $agency): Property
    {
        $this->assertWithinQuota($agency, $property);
        $this->assertComplete($property);

        $property->update(['status' => PropertyStatus::Published]);

        return $property;
    }

    private function assertWithinQuota(Agency $agency, Property $property): void
    {
        $quota = $agency->subscription?->quota_snapshot['property_quota'] ?? null;

        if ($quota === null) {
            return; // unlimited
        }

        $publishedCount = $agency->properties()
            ->where('status', PropertyStatus::Published->value)
            ->where('id', '!=', $property->id)
            ->count();

        if ($publishedCount >= $quota) {
            throw new PropertyQuotaExceededException();
        }
    }

    private function assertComplete(Property $property): void
    {
        if (blank($property->description)) {
            throw new IncompletePropertyListingException('une description est requise');
        }

        if ($property->images()->count() === 0) {
            throw new IncompletePropertyListingException('au moins une photo est requise');
        }
    }
}
