<?php

namespace App\Actions\Property;

use App\Enums\PropertyAvailability;
use App\Enums\PropertyStatus;
use App\Models\Agency;
use App\Models\Property;
use Illuminate\Support\Facades\DB;

class CreateProperty
{
    public function __construct(private readonly SyncPropertyDetails $syncDetails) {}

    /**
     * @param  array<string, mixed>  $data
     */
    public function handle(Agency $agency, array $data): Property
    {
        $sale = $data['sale'] ?? null;
        $rental = $data['rental'] ?? null;
        unset($data['sale'], $data['rental']);

        $data['agency_id'] = $agency->id;
        $data['status'] = PropertyStatus::Draft;
        $data['availability'] = PropertyAvailability::Available;

        // The trunk and its specialisation form one listing: a property saved
        // without its price or its rent would be visible and unusable.
        return DB::transaction(function () use ($data, $sale, $rental) {
            $property = Property::create($data);

            return $this->syncDetails->handle($property, $sale, $rental);
        });
    }
}
