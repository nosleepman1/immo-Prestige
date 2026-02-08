<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PostResource extends JsonResource
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
            'user' => $this->whenLoaded('user', fn () => ['id' => $this->user->id, 'name' => $this->user->name]),
            'property' => new PropertyResource($this->whenLoaded('property')),
            'likes_count' => $this->when(isset($this->likes_count), fn () => $this->likes_count),
            'comments_count' => $this->when(isset($this->comments_count), fn () => $this->comments_count),
            'is_liked_by_user' => (bool) ($this->is_liked_by_user ?? false),
            'created_at' => $this->created_at,
        ];
    }
}
