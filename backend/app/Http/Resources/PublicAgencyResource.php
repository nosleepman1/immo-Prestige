<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Safe public projection of an agency: no legal documents, id_card, private
 * contact or subscription data. Used inside public property responses.
 */
class PublicAgencyResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'company_name' => $this->company_name,
            'city' => $this->city,
            'is_verified' => $this->isVerified(),
        ];
    }
}
