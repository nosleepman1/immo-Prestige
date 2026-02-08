<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PlanResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'price' => $this->price,
            'currency' => 'XOF',
            'billing_period_months' => $this->billing_period_months,
            'property_quota' => $this->property_quota,
            'featured_quota' => $this->featured_quota,
        ];
    }
}
