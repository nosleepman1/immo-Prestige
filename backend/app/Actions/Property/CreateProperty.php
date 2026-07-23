<?php

namespace App\Actions\Property;

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

        return Property::create($data);
    }
}
