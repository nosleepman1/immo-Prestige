<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MaintenanceTicketResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'reference' => $this->reference,
            'lease_id' => $this->lease_id,
            'title' => $this->title,
            'description' => $this->description,
            'category' => $this->category,
            'category_label' => $this->category->label(),
            'priority' => $this->priority,
            'priority_label' => $this->priority->label(),
            'status' => $this->status,
            'status_label' => $this->status->label(),
            'is_live' => $this->status->isLive(),
            'resolved_at' => $this->resolved_at,
            'resolution_note' => $this->resolution_note,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'property' => $this->whenLoaded('property', fn () => [
                'id' => $this->property->id,
                'name' => $this->property->name,
                'city' => $this->property->city,
            ]),
            'reporter' => $this->whenLoaded('reporter', fn () => [
                'id' => $this->reporter->id,
                'name' => $this->reporter->name,
            ]),
            'images' => MaintenanceTicketImageResource::collection($this->whenLoaded('images')),
            'messages' => MaintenanceTicketMessageResource::collection($this->whenLoaded('messages')),
            'messages_count' => $this->whenCounted('messages'),
        ];
    }
}
