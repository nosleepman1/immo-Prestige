<?php

namespace App\Actions\Property;

use App\Models\Property;

class UpdateProperty
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function handle(Property $property, array $data): Property
    {
        $property->update($data);

        return $property;
    }
}
