<?php

namespace App\Actions\Property;

use App\Models\Property;

class DeleteProperty
{
    public function handle(Property $property): void
    {
        $property->delete();
    }
}
