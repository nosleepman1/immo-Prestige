<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PropertySearchRequest extends FormRequest
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
            'country' => 'nullable|string|max:100',
            'region' => 'nullable|string|max:100',
            'city' => 'nullable|string|max:100',
            'property_type_id' => 'nullable|exists:property_types,id',
            'price_min' => 'nullable|numeric|min:0',
            'price_max' => 'nullable|numeric|min:0',
            'rooms' => 'nullable|integer|min:0',
            'bedrooms' => 'nullable|integer|min:0',
            'sold' => 'nullable|boolean',
            'per_page' => 'nullable|integer|min:1|max:50',
        ];
    }
}
