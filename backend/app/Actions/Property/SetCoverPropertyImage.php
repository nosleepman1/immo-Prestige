<?php

namespace App\Actions\Property;

use App\Models\PropertyImage;
use Illuminate\Support\Facades\DB;

class SetCoverPropertyImage
{
    public function handle(PropertyImage $image): PropertyImage
    {
        DB::transaction(function () use ($image) {
            PropertyImage::where('property_id', $image->property_id)->update(['is_cover' => false]);
            $image->update(['is_cover' => true]);
        });

        return $image->fresh();
    }
}
