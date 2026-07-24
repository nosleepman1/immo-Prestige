<?php

namespace App\Actions\Property;

use App\Enums\PropertyStatus;
use App\Models\Agency;
use App\Models\Property;

class CreateProperty
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function handle(Agency $agency, array $data): Property
    {
        $data['agency_id'] = $agency->id;
        $data['status'] = PropertyStatus::Draft;

        return Property::create($data);
    }
}
