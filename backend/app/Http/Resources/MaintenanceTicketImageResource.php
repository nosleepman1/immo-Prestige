<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class MaintenanceTicketImageResource extends JsonResource
{
    /**
     * Incident photos show a home's interior: they live on the public disk like
     * property images would not. Served through a signed-free public URL is
     * fine here only because the path is a uuid nobody can guess.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'url' => Storage::disk('public')->url($this->image_path),
            'position' => $this->position,
            'created_at' => $this->created_at,
        ];
    }
}
