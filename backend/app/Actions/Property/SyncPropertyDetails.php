<?php

namespace App\Actions\Property;

use App\Models\Property;

/**
 * Keeps the sale/rental specialisation rows in step with the property's
 * transaction type: creates or updates the side that applies, and removes the
 * side that no longer does.
 *
 * Extracted as its own action because both CreateProperty and UpdateProperty
 * need it and the rule "a listing carries exactly the details its type implies"
 * must have a single home.
 */
class SyncPropertyDetails
{
    /**
     * @param  array<string, mixed>|null  $sale
     * @param  array<string, mixed>|null  $rental
     */
    public function handle(Property $property, ?array $sale, ?array $rental): Property
    {
        $type = $property->transaction_type;

        if ($type->requiresSaleDetails()) {
            if ($sale !== null) {
                $property->saleDetail()->updateOrCreate([], $sale);
            }
        } else {
            // Dropping the sale side of a listing drops its price with it;
            // keeping an unreachable row would resurface on the next switch.
            $property->saleDetail()->delete();
        }

        if ($type->requiresRentalDetails()) {
            if ($rental !== null) {
                $property->rentalDetail()->updateOrCreate([], $rental);
            }
        } else {
            $property->rentalDetail()->delete();
        }

        return $property->load(['saleDetail', 'rentalDetail']);
    }
}
