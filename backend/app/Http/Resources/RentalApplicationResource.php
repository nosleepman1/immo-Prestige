<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RentalApplicationResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status,
            'desired_start_date' => $this->desired_start_date?->toDateString(),
            'desired_duration_months' => $this->desired_duration_months,
            'message' => $this->message,
            'rejection_reason' => $this->rejection_reason,
            'requested_documents' => $this->requested_documents,
            'reviewed_at' => $this->reviewed_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'property' => new PropertyResource($this->whenLoaded('property')),
            // The agency needs to reach the candidate; nothing more of their
            // account is exposed than the name and the means to contact them.
            'applicant' => $this->whenLoaded('applicant', fn () => [
                'id' => $this->applicant->id,
                'name' => $this->applicant->name,
                'email' => $this->applicant->email,
            ]),
            'documents' => RentalApplicationDocumentResource::collection($this->whenLoaded('documents')),
            'documents_count' => $this->whenCounted('documents'),
        ];
    }
}
