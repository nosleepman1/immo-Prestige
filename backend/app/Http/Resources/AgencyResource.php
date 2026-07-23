<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AgencyResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'company_name' => $this->company_name,
            'manager_name' => $this->manager_name,
            'description' => $this->description,
            'address' => $this->address,
            'city' => $this->city,
            'activity_zone' => $this->activity_zone,
            'phone' => $this->phone,
            'id_card' => $this->id_card,
            'status' => $this->status,
            'refusal_reason' => $this->refusal_reason,
            'activated_at' => $this->activated_at,
            'user_id' => $this->user_id,
            'documents' => AgencyDocumentResource::collection($this->whenLoaded('documents')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
