<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PropertyRentalDetailResource extends JsonResource
{
    /**
     * `monthly_total` and `move_in_cost` are computed server-side on purpose:
     * three clients would otherwise each reimplement the same arithmetic and
     * drift apart on the day a rule changes.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'rent_amount' => $this->rent_amount,
            'charges_amount' => $this->charges_amount,
            'deposit_amount' => $this->deposit_amount,
            'advance_months' => $this->advance_months,
            'min_lease_months' => $this->min_lease_months,
            'available_from' => $this->available_from?->toDateString(),
            'monthly_total' => $this->monthlyTotal(),
            'move_in_cost' => $this->moveInCost(),
        ];
    }
}
