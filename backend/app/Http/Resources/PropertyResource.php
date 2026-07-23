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
            'agency' => new AgencyResource($this->whenLoaded('agency')),
            'devise' => new DeviseResource($this->whenLoaded('devise')),
            'is_posted' => $this->is_posted,
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
            'is_active' => $this->is_active,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'images' => PropertyImageResource::collection($this->whenLoaded('images'))

        ];
    }
}
