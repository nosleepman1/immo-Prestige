<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SubscriptionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status,
            'is_active' => $this->isActive(),
            'plan' => new PlanResource($this->whenLoaded('plan')),
            'price_snapshot' => $this->price_snapshot,
            'quota_snapshot' => $this->quota_snapshot,
            'trial_ends_at' => $this->trial_ends_at,
            'starts_at' => $this->starts_at,
            'ends_at' => $this->ends_at,
        ];
    }
}
