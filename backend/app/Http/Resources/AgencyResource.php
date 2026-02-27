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
            'description' => $this->description,
            'address' => $this->address,
            'city' => $this->city,
            'phone' => $this->phone,
            'id_card' => $this->id_card,
            'is_active' => $this->is_active,
            'user_id' => $this->user_id,
            'created_at' => $this->createdAt,
            'updated_at' => $this->updatedAt
        ];
    }
}
