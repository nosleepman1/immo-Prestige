<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PropertyResource extends JsonResource
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
            'property_type' => new PropertyTypeResource($this->whenLoaded('propertyType')),
            'agency' => new PublicAgencyResource($this->whenLoaded('agency')),
            'devise' => new DeviseResource($this->whenLoaded('devise')),
            'status' => $this->status,
            'name' => $this->name,
            'description' => $this->description,
            'surface' => $this->surface,
            'rooms' => $this->rooms,
            'bedrooms' => $this->bedrooms,
            'floor' => $this->floor,
            'furnished' => $this->furnished,
            'price' => $this->price,
            'country' => $this->country,
            'region' => $this->region,
            'city' => $this->city,
            'longitude' => $this->longitude,
            'latitude' => $this->latitude,
            'sold' => $this->sold,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'images' => PropertyImageResource::collection($this->whenLoaded('images')),
        ];
    }
}
