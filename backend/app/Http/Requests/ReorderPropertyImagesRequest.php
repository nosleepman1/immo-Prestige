<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReorderPropertyImagesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'image_ids' => 'required|array|min:1',
            'image_ids.*' => 'integer|distinct|exists:property_images,id',
        ];
    }
}
