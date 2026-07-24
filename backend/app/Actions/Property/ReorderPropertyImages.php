<?php

namespace App\Actions\Property;

use App\Models\Property;
use App\Models\PropertyImage;
use Illuminate\Support\Facades\DB;

class ReorderPropertyImages
{
    /**
     * @param  int[]  $orderedIds  Image ids in the desired display order. Ids not
     *                             belonging to the property are ignored (the update
     *                             is scoped by property_id).
     */
    public function handle(Property $property, array $orderedIds): void
    {
        DB::transaction(function () use ($property, $orderedIds) {
            foreach ($orderedIds as $position => $id) {
                PropertyImage::where('property_id', $property->id)
                    ->where('id', $id)
                    ->update(['position' => $position]);
            }
        });
    }
}
