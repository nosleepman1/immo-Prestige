<?php

namespace App\Actions\Property;

use App\Models\Property;
use Illuminate\Support\Facades\DB;

class UpdateProperty
{
    public function __construct(private readonly SyncPropertyDetails $syncDetails) {}

    /**
     * @param  array<string, mixed>  $data
     */
    public function handle(Property $property, array $data): Property
    {
        $sale = $data['sale'] ?? null;
        $rental = $data['rental'] ?? null;
        unset($data['sale'], $data['rental']);

        return DB::transaction(function () use ($property, $data, $sale, $rental) {
            $property->update($data);

            // Re-read the type from the model: it may have just changed, and the
            // specialisation follows the saved value, not the incoming payload.
            return $this->syncDetails->handle($property->refresh(), $sale, $rental);
        });
    }
}
