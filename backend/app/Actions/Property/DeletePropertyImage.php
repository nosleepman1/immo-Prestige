<?php

namespace App\Actions\Property;

use App\Models\PropertyImage;

class DeletePropertyImage
{
    public function handle(PropertyImage $image): void
    {
        $image->delete();
    }
}
