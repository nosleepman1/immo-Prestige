<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RentalApplicationDocumentResource extends JsonResource
{
    /**
     * `file_path` is never exposed: the file lives on a private disk and is
     * only reachable through the authenticated download route.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'type_label' => $this->type->label(),
            'original_name' => $this->original_name,
            'size_bytes' => $this->size_bytes,
            'mime_type' => $this->mime_type,
            'download_url' => route('rental-application-documents.download', $this->id),
            'created_at' => $this->created_at,
        ];
    }
}
