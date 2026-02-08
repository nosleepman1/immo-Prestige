<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ConversationResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'property' => new PropertyResource($this->whenLoaded('property')),
            'client' => $this->whenLoaded('client', fn () => ['id' => $this->client->id, 'name' => $this->client->name]),
            'agency' => new PublicAgencyResource($this->whenLoaded('agency')),
            'last_message_at' => $this->last_message_at,
            'unread_count' => $this->when(isset($this->unread_count), fn () => (int) $this->unread_count),
            'created_at' => $this->created_at,
        ];
    }
}
