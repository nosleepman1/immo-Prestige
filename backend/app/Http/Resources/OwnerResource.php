<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Owners are agency-internal: this resource is never rendered on a public
 * listing, only inside the agency's own space.
 */
class OwnerResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'last_name' => $this->last_name,
            'first_name' => $this->first_name,
            'full_name' => $this->fullName(),
            'phone' => $this->phone,
            'email' => $this->email,
            'address' => $this->address,
            'id_document_number' => $this->id_document_number,
            'notes' => $this->notes,
            'has_account' => $this->user_id !== null,
            'properties_count' => $this->whenCounted('properties'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
