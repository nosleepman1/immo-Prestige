<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class PropertyImageResource extends JsonResource
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
            'url' => $this->resolveUrl(),
            'is_cover' => $this->is_cover,
            'position' => $this->position,
        ];
    }

    /**
     * Demo data seeds remote placeholder images by full URL. Prefixing those
     * with the storage path produced ".../storage/https://picsum.photos/...",
     * which resolves to nothing — every listing looked image-less.
     */
    private function resolveUrl(): string
    {
        return str_starts_with($this->image_path, 'http')
            ? $this->image_path
            : Storage::disk('public')->url($this->image_path);
    }
}
