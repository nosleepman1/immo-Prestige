<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LeaseResource extends JsonResource
{
    /**
     * File paths are never rendered: both documents live on the private disk
     * and are reachable only through the policy-checked download routes.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'reference' => $this->reference,
            'status' => $this->status,
            'status_label' => $this->status->label(),
            'start_date' => $this->start_date?->toDateString(),
            'end_date' => $this->end_date?->toDateString(),
            'duration_months' => $this->duration_months,

            'rent_amount' => $this->rent_amount,
            'charges_amount' => $this->charges_amount,
            'deposit_amount' => $this->deposit_amount,
            'advance_months' => $this->advance_months,
            // Derived server-side so the three clients cannot disagree on what
            // the tenant owes.
            'monthly_total' => $this->monthlyTotal(),
            'initial_payment' => $this->initialPayment(),

            'periodicity' => $this->periodicity,
            'payment_day' => $this->payment_day,
            'notice_period_days' => $this->notice_period_days,

            'has_generated_contract' => $this->generated_contract_path !== null,
            'has_signed_contract' => $this->signed_contract_path !== null,
            'signed_at' => $this->signed_at,
            'signature_rejection_reason' => $this->signature_rejection_reason,
            'validated_at' => $this->validated_at,
            'termination_date' => $this->termination_date?->toDateString(),
            'termination_reason' => $this->termination_reason,

            'property' => new PropertyResource($this->whenLoaded('property')),
            'tenant' => $this->whenLoaded('tenant', fn () => [
                'id' => $this->tenant->id,
                'name' => $this->tenant->name,
                'email' => $this->tenant->email,
            ]),
            'agency' => new PublicAgencyResource($this->whenLoaded('agency')),
            'owner' => new OwnerResource($this->whenLoaded('owner')),

            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
